const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const SRC = path.resolve(__dirname, "..");
const languages = require("./languages.json");
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

function sortUrl(a, b) {
  if (a === "https://spinnit.site/") return -1;
  if (b === "https://spinnit.site/") return 1;
  return a.localeCompare(b);
}

for (const file of walk(SRC)) {
  let rel = path.relative(SRC, file).replace(/\\/g, "/");
  const first = rel.split("/")[0];
  const lang = localizedCodes.has(first) ? first : languages.default;
  if (lang !== languages.default) rel = rel.split("/").slice(1).join("/");

  const parsed = matter(fs.readFileSync(file, "utf8"));
  if (parsed.data.permalink === false) continue;

  const url = urlFromRel(rel);
  if (!pageLocales[url]) pageLocales[url] = [];
  if (!pageLocales[url].includes(lang)) pageLocales[url].push(lang);

  if (!parsed.data.noindex && parsed.data.canonical) {
    const loc = String(parsed.data.canonical).replace(/\/index\.html$/, "/");
    if (!sitemapUrls.includes(loc)) sitemapUrls.push(loc);
  }
}

pageLocales.sitemapUrls = sitemapUrls.sort(sortUrl);

module.exports = pageLocales;
