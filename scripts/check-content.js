#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const SITE_URL = "https://spinnit.site";
const languages = JSON.parse(fs.readFileSync(path.join(SRC, "_data", "languages.json"), "utf8"));
const localeMap = Object.fromEntries(languages.available.map((l) => [l.code, l]));
const pageLocales = require(path.join(SRC, "_data", "pageLocales.js"));
const incompleteLocalePages = JSON.parse(fs.readFileSync(path.join(SRC, "_data", "incompleteLocalePages.json"), "utf8"));

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function urlFromRel(rel) {
  const withoutExt = rel.replace(/\.html$/, "");
  if (withoutExt === "index") return "/";
  if (withoutExt.endsWith("/index")) return `/${withoutExt.replace(/\/index$/, "/")}`;
  return `/${withoutExt}.html`;
}

function urlForFile(file) {
  return urlFromRel(path.relative(SRC, file).replace(/\\/g, "/"));
}

function fail(list, file, message) {
  list.push(`${path.relative(ROOT, file)}: ${message}`);
}

function checkJsonLd(errors, file, data) {
  if (typeof data.jsonLd === "string") {
    try {
      JSON.parse(data.jsonLd);
    } catch (e) {
      fail(errors, file, `invalid front-matter jsonLd (${e.message})`);
    }
  }

  if (typeof data.extraHead === "string") {
    const rx = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = rx.exec(data.extraHead))) {
      try {
        JSON.parse(m[1]);
      } catch (e) {
        fail(errors, file, `invalid extraHead JSON-LD (${e.message})`);
      }
    }
  }
}

function checkLocalizedUrls(errors, file, data) {
  const rel = path.relative(SRC, file).replace(/\\/g, "/");
  const match = rel.match(/^([a-z]{2}(?:-[A-Z]{2})?)\//);
  if (!match) return;

  const lang = match[1];
  const locale = localeMap[lang];
  if (!locale || lang === languages.default) return;
  const prefix = locale.prefix || `/${lang}`;

  if (data.lang !== lang) {
    fail(errors, file, `localized page must set lang: ${lang}`);
  }

  if (locale.dir === "rtl" && data.dir !== "rtl") {
    fail(errors, file, `RTL localized page must set dir: rtl`);
  }

  if (typeof data.canonical === "string" && data.canonical.startsWith(`${SITE_URL}/`) && !data.canonical.startsWith(`${SITE_URL}${prefix}/`)) {
    fail(errors, file, `canonical should point to localized ${prefix}/ URL (found "${data.canonical}")`);
  }

  if (typeof data.navBackHref === "string" && data.navBackHref.startsWith("/") && !data.navBackHref.startsWith(`${prefix}/`)) {
    fail(errors, file, `navBackHref must stay in ${prefix}/ namespace (found "${data.navBackHref}")`);
  }

  if (typeof data.extraHead === "string") {
    const refreshRx = /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=(\/[^"';]+)[^"']*["']/gi;
    let refresh;
    while ((refresh = refreshRx.exec(data.extraHead))) {
      const url = refresh[1];
      if (!url.startsWith(`${prefix}/`)) {
        fail(errors, file, `refresh URL must stay in ${prefix}/ namespace (found "${url}")`);
      }
    }
  }

  if (typeof data.jsonLd === "string") {
    try {
      const obj = JSON.parse(data.jsonLd);
      const stack = [obj];
      while (stack.length) {
        const node = stack.pop();
        if (!node || typeof node !== "object") continue;
        for (const [k, v] of Object.entries(node)) {
          if (typeof v === "string") {
            if ((k.toLowerCase().includes("url") || k === "mainEntityOfPage") &&
              v.startsWith(`${SITE_URL}/`) &&
              v !== `${SITE_URL}/` &&
              !v.startsWith(`${SITE_URL}${prefix}/`)) {
              fail(errors, file, `${k} should point to localized ${prefix}/ URL (found "${v}")`);
            }
          } else if (Array.isArray(v)) {
            for (const item of v) stack.push(item);
          } else if (v && typeof v === "object") {
            stack.push(v);
          }
        }
      }
    } catch {
      // handled by JSON-LD validation already
    }
  }
}

function checkArabicEnglishLeftovers(errors, file, raw) {
  const rel = path.relative(SRC, file).replace(/\\/g, "/");
  if (!rel.startsWith("ar/")) return;

  const obvious = [
    "all tools",
    "free forever",
    "Copy result",
    "Copied!",
    "Generate Number",
    "Recent results",
    "How to Use",
    "Privacy Policy",
    "Terms of Service",
  ];

  for (const phrase of obvious) {
    if (raw.includes(phrase)) {
      fail(errors, file, `Arabic page contains untranslated UI phrase "${phrase}"`);
    }
  }
}

function main() {
  const files = walk(SRC);
  const errors = [];
  const fileUrls = new Set();

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    fileUrls.add(urlForFile(file));
    checkJsonLd(errors, file, data);
    checkLocalizedUrls(errors, file, data);
    checkArabicEnglishLeftovers(errors, file, raw);
  }

  if (!Array.isArray(pageLocales.sitemapUrls) || pageLocales.sitemapUrls.length === 0) {
    errors.push("sitemap data is empty");
  } else if (!pageLocales.sitemapUrls.some((url) => url.startsWith(`${SITE_URL}/ar/`))) {
    errors.push("sitemap data is missing Arabic URLs");
  }

  if (!Array.isArray(pageLocales.sitemapEntries) || pageLocales.sitemapEntries.length !== pageLocales.sitemapUrls.length) {
    errors.push("sitemap entries must match sitemap URL count");
  } else {
    for (const entry of pageLocales.sitemapEntries) {
      if (!entry || !pageLocales.sitemapUrls.includes(entry.loc)) {
        errors.push(`sitemap entry has unknown loc (${entry && entry.loc})`);
        continue;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod || "")) {
        errors.push(`sitemap entry has invalid lastmod for ${entry.loc}`);
      }
    }
  }

  for (const url of incompleteLocalePages) {
    if (!fileUrls.has(url)) {
      errors.push(`incomplete locale page does not exist (${url})`);
    }
    if (pageLocales.sitemapUrls.includes(`${SITE_URL}${url}`)) {
      errors.push(`incomplete locale page is present in sitemap data (${url})`);
    }
  }

  if (errors.length) {
    console.error(`check-content failed with ${errors.length} issue(s):`);
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  console.log(`check-content passed (${files.length} HTML files checked)`);
}

main();
