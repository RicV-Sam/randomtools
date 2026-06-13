#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { parse } = require("node-html-parser");

const ROOT = path.resolve(__dirname, "..");
const SITE_DIR = path.join(ROOT, "_site");
const SITE_URL = "https://spinnit.site";
const MAX_ERRORS_TO_PRINT = 100;

const SKIP_HREF = /^(mailto:|tel:|sms:|javascript:|data:|blob:)/i;
const LOCALIZED_PREFIX = /^\/(?:ar|de)\//;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function normalizePathname(value) {
  let pathname = value || "/";
  try {
    pathname = decodeURI(pathname);
  } catch {
    // Keep the undecoded path if it contains malformed escape sequences.
  }
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  return pathname.replace(/\/index\.html$/, "/");
}

function urlPathForFile(file) {
  const rel = path.relative(SITE_DIR, file).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.replace(/\/index\.html$/, "/")}`;
  return `/${rel}`;
}

function outputFileForUrlPath(urlPath) {
  const clean = normalizePathname(urlPath);
  if (clean === "/") return path.join(SITE_DIR, "index.html");
  if (clean.endsWith("/")) return path.join(SITE_DIR, clean.slice(1), "index.html");
  return path.join(SITE_DIR, clean.slice(1));
}

function cleanText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function htmlLabel(urlPath) {
  return urlPath === "/" ? "/" : urlPath;
}

function isNoindex(root) {
  const robots = root.querySelector('meta[name="robots" i]');
  return Boolean(robots && /noindex/i.test(robots.getAttribute("content") || ""));
}

function isLocalizedAiPage(urlPath) {
  return /^\/(?:ar|de)\/ai\//.test(urlPath);
}

function isSkippablePage(urlPath) {
  return (
    urlPath === "/404.html" ||
    urlPath.endsWith("/404.html") ||
    urlPath === "/offline.html" ||
    // Localized AI mirrors are not in sitemap/SEO QA until a separate
    // translation and currentness review approves them.
    isLocalizedAiPage(urlPath)
  );
}

function isCoreOrganicPage(page) {
  if (page.noindex || isSkippablePage(page.urlPath)) return false;
  if (LOCALIZED_PREFIX.test(page.urlPath)) return false;
  if (!page.canonicalPath || page.canonicalPath !== page.urlPath) return false;
  return true;
}

function baseUrlForPath(urlPath) {
  if (urlPath.endsWith("/")) return `${SITE_URL}${urlPath}`;
  const slash = urlPath.lastIndexOf("/");
  return `${SITE_URL}${urlPath.slice(0, slash + 1)}`;
}

function resolveInternalHref(href, fromPath) {
  const raw = (href || "").trim();
  if (!raw) return { error: "empty href" };
  if (raw === "#") return { path: fromPath, fragment: "" };
  if (raw.startsWith("#")) return { path: fromPath, fragment: raw.slice(1) };
  if (SKIP_HREF.test(raw)) return null;
  if (raw.startsWith("//")) return null;

  try {
    const resolved = new URL(raw, baseUrlForPath(fromPath));
    if (resolved.origin !== SITE_URL) return null;
    return {
      path: normalizePathname(resolved.pathname),
      fragment: resolved.hash ? decodeURIComponent(resolved.hash.slice(1)) : "",
    };
  } catch (e) {
    return { error: `invalid href "${raw}" (${e.message})` };
  }
}

function hasFragment(root, fragment) {
  if (!fragment) return true;
  return root.querySelectorAll("[id], a[name]").some((el) =>
    el.getAttribute("id") === fragment || el.getAttribute("name") === fragment
  );
}

function canonicalPath(root) {
  const canonical = root.querySelector('link[rel="canonical" i]');
  if (!canonical) return "";
  const href = canonical.getAttribute("href") || "";
  try {
    const parsed = new URL(href, SITE_URL);
    if (parsed.origin !== SITE_URL) return "";
    return normalizePathname(parsed.pathname);
  } catch {
    return "";
  }
}

function readSitemapPaths(errors) {
  const sitemapFile = path.join(SITE_DIR, "sitemap.xml");
  if (!fs.existsSync(sitemapFile)) {
    errors.push("_site/sitemap.xml is missing; run npm run build before npm run check:content");
    return new Set();
  }

  const raw = fs.readFileSync(sitemapFile, "utf8");
  const locs = Array.from(raw.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
  const paths = new Set();

  for (const loc of locs) {
    let parsed;
    try {
      parsed = new URL(loc);
    } catch (e) {
      errors.push(`sitemap has invalid URL "${loc}" (${e.message})`);
      continue;
    }

    if (parsed.origin !== SITE_URL) {
      errors.push(`sitemap URL is outside ${SITE_URL}: ${loc}`);
      continue;
    }

    const urlPath = normalizePathname(parsed.pathname);
    const outputFile = outputFileForUrlPath(urlPath);
    if (!fs.existsSync(outputFile)) {
      errors.push(`sitemap URL has no generated page: ${loc}`);
      continue;
    }

    paths.add(urlPath);
  }

  return paths;
}

function addBucket(map, key, value) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function main() {
  const errors = [];

  if (!fs.existsSync(SITE_DIR)) {
    console.error("_site is missing; run npm run build before npm run check:content");
    process.exit(1);
  }

  const files = walk(SITE_DIR);
  const pages = new Map();
  const inbound = new Map();
  let linkCount = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const root = parse(raw);
    const urlPath = urlPathForFile(file);
    const title = cleanText(root.querySelector("title") && root.querySelector("title").text);
    const description = root.querySelector('meta[name="description" i]');
    const h1s = root.querySelectorAll("h1").map((el) => cleanText(el.text));
    const canonical = canonicalPath(root);
    const page = {
      file,
      root,
      urlPath,
      title,
      description: description ? cleanText(description.getAttribute("content")) : "",
      h1s,
      noindex: isNoindex(root),
      canonicalPath: canonical,
    };
    pages.set(urlPath, page);
    inbound.set(urlPath, new Set());
  }

  for (const page of pages.values()) {
    const anchors = page.root.querySelectorAll("a[href]");
    for (const anchor of anchors) {
      const href = anchor.getAttribute("href");
      const resolved = resolveInternalHref(href, page.urlPath);
      if (!resolved) continue;
      linkCount++;

      if (resolved.error) {
        errors.push(`${htmlLabel(page.urlPath)} has ${resolved.error}`);
        continue;
      }

      const targetFile = outputFileForUrlPath(resolved.path);
      if (!fs.existsSync(targetFile)) {
        errors.push(`${htmlLabel(page.urlPath)} links to missing internal URL "${href}"`);
        continue;
      }

      if (resolved.fragment && !isLocalizedAiPage(page.urlPath)) {
        const target = pages.get(resolved.path);
        if (target && !hasFragment(target.root, resolved.fragment)) {
          errors.push(`${htmlLabel(page.urlPath)} links to missing fragment "${href}"`);
        }
      }

      if (resolved.path !== page.urlPath && inbound.has(resolved.path)) {
        inbound.get(resolved.path).add(page.urlPath);
      }
    }
  }

  const titleBuckets = new Map();
  const h1Buckets = new Map();
  const sitemapPaths = readSitemapPaths(errors);
  const skippedLocalizedAiPages = Array.from(pages.values()).filter((page) => isLocalizedAiPage(page.urlPath)).length;

  for (const page of pages.values()) {
    if (page.noindex || isSkippablePage(page.urlPath)) continue;

    if (!page.title) errors.push(`${htmlLabel(page.urlPath)} is missing a <title>`);
    if (!page.description) errors.push(`${htmlLabel(page.urlPath)} is missing a meta description`);
    if (!page.canonicalPath) errors.push(`${htmlLabel(page.urlPath)} is missing a same-site canonical`);
    if (page.h1s.length !== 1) {
      errors.push(`${htmlLabel(page.urlPath)} should have exactly one H1 (found ${page.h1s.length})`);
    }

    if (!isCoreOrganicPage(page)) continue;

    addBucket(titleBuckets, page.title, page.urlPath);
    addBucket(h1Buckets, page.h1s[0], page.urlPath);

    if (!sitemapPaths.has(page.urlPath)) {
      errors.push(`sitemap is missing core organic page ${htmlLabel(page.urlPath)}`);
    }

    if (page.urlPath !== "/" && inbound.get(page.urlPath).size === 0) {
      errors.push(`${htmlLabel(page.urlPath)} is orphaned (no internal links from generated HTML)`);
    }
  }

  for (const [title, urls] of titleBuckets) {
    if (urls.length > 1) {
      errors.push(`duplicate title "${title}" on ${urls.map(htmlLabel).join(", ")}`);
    }
  }

  for (const [h1, urls] of h1Buckets) {
    if (urls.length > 1) {
      errors.push(`duplicate H1 "${h1}" on ${urls.map(htmlLabel).join(", ")}`);
    }
  }

  for (const sitemapPath of sitemapPaths) {
    const page = pages.get(sitemapPath);
    if (page && page.noindex) {
      errors.push(`sitemap includes noindex page ${htmlLabel(sitemapPath)}`);
    }
  }

  if (errors.length) {
    console.error(`check-seo failed with ${errors.length} issue(s):`);
    for (const error of errors.slice(0, MAX_ERRORS_TO_PRINT)) {
      console.error(`- ${error}`);
    }
    if (errors.length > MAX_ERRORS_TO_PRINT) {
      console.error(`- ...and ${errors.length - MAX_ERRORS_TO_PRINT} more`);
    }
    process.exit(1);
  }

  const aiNote = skippedLocalizedAiPages ? `; ${skippedLocalizedAiPages} localized AI pages skipped intentionally` : "";
  console.log(`check-seo passed (${files.length} HTML files, ${linkCount} internal links, ${sitemapPaths.size} sitemap URLs${aiNote})`);
}

main();
