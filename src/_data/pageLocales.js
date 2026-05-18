const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const SRC = path.resolve(__dirname, "..");
const languages = require("./languages.json");
const site = require("./site.json");
const incompleteLocalePages = new Set(require("./incompleteLocalePages.json"));
const localizedCodes = new Set(languages.available.map((l) => l.code).filter((code) => code !== languages.default));

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["_includes", "_data", "assets", "icons", ".well-known"].includes(entry.name)) continue;
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

function urlFromRel(rel) {
  const withoutExt = rel.replace(/\.html$/, "");
  if (withoutExt === "index") return "/";
  if (withoutExt.endsWith("/index")) return `/${withoutExt.replace(/\/index$/, "/")}`;
  return `/${withoutExt}.html`;
}

const pageLocales = {};
const sitemapUrls = [];
const sitemapEntryMap = new Map();
const sitemapAllowlist = new Set([
  "https://spinnit.site/",
  "https://spinnit.site/classroom-random-tools/",
  "https://spinnit.site/classroom-random-tools/random-student-picker-guide/",
  "https://spinnit.site/classroom-random-tools/no-repeat-student-picker/",
  "https://spinnit.site/classroom-random-tools/random-team-generator-for-classrooms/",
  "https://spinnit.site/classroom-random-tools/wheel-of-names-classroom-ideas/",
  "https://spinnit.site/classroom-random-tools/fair-classroom-participation/",
  "https://spinnit.site/tools/",
  "https://spinnit.site/tools/random-student-picker.html",
  "https://spinnit.site/tools/wheel-of-names.html",
  "https://spinnit.site/tools/random-name-picker.html",
  "https://spinnit.site/tools/team-picker.html",
  "https://spinnit.site/tools/list-shuffler.html",
  "https://spinnit.site/tools/random-number.html",
  "https://spinnit.site/tools/coin-flip.html",
  "https://spinnit.site/tools/dice-roller.html",
  "https://spinnit.site/blog/how-to-use-a-wheel-of-names-for-classroom.html",
  "https://spinnit.site/blog/how-to-pick-random-teams-fairly.html",
  "https://spinnit.site/privacy.html",
  "https://spinnit.site/contact.html",
  "https://spinnit.site/ar/"
]);

function formatDate(value) {
  if (!value) return site.sitemapLastmod || "2026-05-06";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value).trim();
  const match = text.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : (site.sitemapLastmod || "2026-05-06");
}

function sortUrl(a, b) {
  if (a === "https://spinnit.site/") return -1;
  if (b === "https://spinnit.site/") return 1;
  return a.localeCompare(b);
}

function priorityFor(loc) {
  const p = loc.replace("https://spinnit.site", "");
  if (p === "/" || p === "") return "1.0";
  if (p === "/classroom-random-tools/") return "0.95";
  if (p.startsWith("/classroom-random-tools/")) return "0.85";
  if (p.startsWith("/ar/")) return "0.3";
  if (p.startsWith("/de/")) return "0.5";
  if (p.startsWith("/tools/")) return "0.9";
  if (p.startsWith("/blog/")) return "0.8";
  if (p.startsWith("/ai/")) return "0.7";
  if (/^\/(about|contact|privacy|terms)\.html$/.test(p)) return "0.4";
  return "0.6";
}

function changefreqFor(loc) {
  const p = loc.replace("https://spinnit.site", "");
  if (p === "/" || p === "/tools/" || p === "/blog/" || p === "/ai/") return "weekly";
  if (/^\/(about|contact|privacy|terms)\.html$/.test(p)) return "yearly";
  return "monthly";
}

function localizedUrl(lang, url) {
  if (lang === languages.default) return url;
  const locale = languages.available.find((l) => l.code === lang);
  const prefix = locale && locale.prefix ? locale.prefix : `/${lang}`;
  return `${prefix}${url}`;
}

function isIndexReady(lang, url, data) {
  if (data.noindex || data.translationStatus === "incomplete") return false;
  return !incompleteLocalePages.has(localizedUrl(lang, url));
}

for (const file of walk(SRC)) {
  let rel = path.relative(SRC, file).replace(/\\/g, "/");
  const first = rel.split("/")[0];
  const lang = localizedCodes.has(first) ? first : languages.default;
  if (lang !== languages.default) rel = rel.split("/").slice(1).join("/");

  const parsed = matter(fs.readFileSync(file, "utf8"));
  if (parsed.data.permalink === false) continue;

  const url = urlFromRel(rel);
  const indexReady = isIndexReady(lang, url, parsed.data);
  if (indexReady) {
    if (!pageLocales[url]) pageLocales[url] = [];
    if (!pageLocales[url].includes(lang)) pageLocales[url].push(lang);
  }

  if (indexReady && parsed.data.canonical) {
    const loc = String(parsed.data.canonical).replace(/\/index\.html$/, "/");
    if (!sitemapAllowlist.has(loc)) continue;
    const lastmod = formatDate(parsed.data.dateModified || parsed.data.updated || parsed.data.datePublished);
    if (!sitemapUrls.includes(loc)) sitemapUrls.push(loc);
    if (!sitemapEntryMap.has(loc)) {
      sitemapEntryMap.set(loc, { loc, lastmod, priority: priorityFor(loc), changefreq: changefreqFor(loc) });
    } else if (lastmod > sitemapEntryMap.get(loc).lastmod) {
      sitemapEntryMap.get(loc).lastmod = lastmod;
    }
  }
}

pageLocales.sitemapUrls = sitemapUrls.sort(sortUrl);
pageLocales.sitemapEntries = Array.from(sitemapEntryMap.values()).sort((a, b) => sortUrl(a.loc, b.loc));

module.exports = pageLocales;
