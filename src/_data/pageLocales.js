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
const localizedSitemapAllowlist = new Set([
  "https://spinnit.site/ar/",
  "https://spinnit.site/de/",
  "https://spinnit.site/de/tools/",
  "https://spinnit.site/de/tools/random-number.html"
]);
const AI_CLUSTER_INDEXABILITY_REVIEWED = "2026-06-13";
const AI_SITEMAP_POLICY =
  "Vetted English AI Tool Radar pages are included in the XML sitemap after indexability QA. Localized AI mirrors remain excluded until separately reviewed.";
const aiSitemapAllowedPaths = new Set([
  "/ai/",
  "/ai/all-tools/",
  "/ai/best/",
  "/ai/best/best-ai-tools-for-content-creators.html",
  "/ai/best/best-ai-tools-for-productivity.html",
  "/ai/best/best-ai-tools-for-small-business.html",
  "/ai/best/best-ai-tools-for-students.html",
  "/ai/blog/best-ai-tools-for-marketing-teams.html",
  "/ai/blog/best-ai-tools-for-research-workflows.html",
  "/ai/blog/best-ai-tools-for-solopreneurs.html",
  "/ai/blog/best-free-ai-tools-2026.html",
  "/ai/blog/chatgpt-alternatives-worth-trying.html",
  "/ai/blog/how-to-choose-the-right-ai-tool.html",
  "/ai/blog/which-ai-tool-should-you-pay-for-first.html",
  "/ai/categories/ai-audio-tools.html",
  "/ai/categories/ai-coding-tools.html",
  "/ai/categories/ai-image-tools.html",
  "/ai/categories/ai-productivity-tools.html",
  "/ai/categories/ai-research-tools.html",
  "/ai/categories/ai-video-tools.html",
  "/ai/categories/ai-writing-tools.html",
  "/ai/compare/",
  "/ai/compare/chatgpt-vs-claude.html",
  "/ai/compare/chatgpt-vs-perplexity.html",
  "/ai/compare/claude-vs-gemini.html",
  "/ai/compare/midjourney-vs-runway.html",
  "/ai/directory/",
  "/ai/how-we-review/",
  "/ai/picker/",
  "/ai/suggest-a-tool/",
  "/ai/tools/",
  "/ai/tools/chatgpt.html",
  "/ai/tools/claude.html",
  "/ai/tools/cursor.html",
  "/ai/tools/elevenlabs.html",
  "/ai/tools/gemini.html",
  "/ai/tools/midjourney.html",
  "/ai/tools/perplexity.html",
  "/ai/tools/runway.html"
]);
const sitemapPathBlocklist = [
  /^\/(?:ar|de)\//,
  /^\/offline\.html$/,
  /^\/404\.html$/,
  /\/404\.html$/
];

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
  if (/^\/(about|contact|privacy|terms|how-spinnit-tools-work|randomness-and-fairness)\.html$/.test(p)) return "0.4";
  return "0.6";
}

function changefreqFor(loc) {
  const p = loc.replace("https://spinnit.site", "");
  if (p === "/" || p === "/tools/" || p === "/blog/" || p === "/ai/") return "weekly";
  if (/^\/(about|contact|privacy|terms|how-spinnit-tools-work|randomness-and-fairness)\.html$/.test(p)) return "yearly";
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

function isSitemapAllowed(lang, loc) {
  if (lang !== languages.default) return localizedSitemapAllowlist.has(loc);
  const p = loc.replace(site.url, "") || "/";
  if (p.startsWith("/ai/")) return aiSitemapAllowedPaths.has(p);
  return !sitemapPathBlocklist.some((rx) => rx.test(p));
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
    if (!isSitemapAllowed(lang, loc)) continue;
    const locPath = loc.replace(site.url, "") || "/";
    const lastmod = formatDate(
      parsed.data.dateModified ||
      parsed.data.updated ||
      parsed.data.datePublished ||
      (aiSitemapAllowedPaths.has(locPath) ? AI_CLUSTER_INDEXABILITY_REVIEWED : null)
    );
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
pageLocales.aiSitemapPolicy = AI_SITEMAP_POLICY;
pageLocales.aiSitemapAllowedPaths = Array.from(aiSitemapAllowedPaths).sort();

module.exports = pageLocales;
