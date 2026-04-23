#!/usr/bin/env node
/**
 * Translate Spinnit site pages to another language.
 *
 * Usage:
 *   node scripts/translate.js <lang>            # translate all pages
 *   node scripts/translate.js <lang> <glob>     # translate matching files only
 *
 * Example:
 *   node scripts/translate.js de
 *   node scripts/translate.js de privacy.html
 *
 * Output goes to src/<lang>/<same-relative-path>.
 *
 * Strategy:
 *   - Parse front matter + body
 *   - Translate: title, description, ogTitle, ogDescription, JSON-LD name/description,
 *     and all visible text nodes in the body HTML.
 *   - Preserve: HTML structure, attributes, inline scripts, styles, URLs.
 *   - Rewrite: canonical URL to include /<lang>/, internal <a href> links to /<lang>/...
 *   - Cache translated strings in .translation-cache/<lang>.json so re-runs skip work.
 *   - Throttle: 1 req/sec to avoid Google rate-limiting.
 *   - Fallback: if Google fails, try LibreTranslate public instance.
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { parse: parseHtml } = require("node-html-parser");
const { translate: googleTranslate } = require("@vitalets/google-translate-api");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const CACHE_DIR = path.join(ROOT, ".translation-cache");

const LANG = process.argv[2];
const FILTER = process.argv[3]; // optional substring match on relative path

if (!LANG) {
  console.error("Usage: node scripts/translate.js <lang> [filter]");
  process.exit(1);
}

const OUT_DIR = path.join(SRC, LANG);
const CACHE_FILE = path.join(CACHE_DIR, `${LANG}.json`);

// ---------- cache ----------

fs.mkdirSync(CACHE_DIR, { recursive: true });
const cache = fs.existsSync(CACHE_FILE)
  ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"))
  : {};
let cacheDirty = false;
function saveCache() {
  if (cacheDirty) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    cacheDirty = false;
  }
}

// ---------- translate primitives ----------

let lastCall = 0;
const MIN_GAP_MS = 1100; // ~1 req/sec

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function throttle() {
  const gap = Date.now() - lastCall;
  if (gap < MIN_GAP_MS) await sleep(MIN_GAP_MS - gap);
  lastCall = Date.now();
}

async function translateGoogle(text, to) {
  const res = await googleTranslate(text, { to });
  return res.text;
}

async function translateLibre(text, to) {
  const res = await fetch("https://libretranslate.de/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: "en", target: to, format: "text" }),
  });
  if (!res.ok) throw new Error(`LibreTranslate HTTP ${res.status}`);
  const data = await res.json();
  return data.translatedText;
}

async function translate(text, to) {
  if (!text || !text.trim()) return text;
  const key = `${to}:${text}`;
  if (cache[key]) return cache[key];

  await throttle();

  try {
    const out = await translateGoogle(text, to);
    cache[key] = out;
    cacheDirty = true;
    return out;
  } catch (e) {
    console.warn(`  [google failed: ${e.message}] → fallback to LibreTranslate`);
    try {
      const out = await translateLibre(text, to);
      cache[key] = out;
      cacheDirty = true;
      return out;
    } catch (e2) {
      console.error(`  [libre also failed: ${e2.message}] keeping original`);
      return text;
    }
  }
}

// ---------- text node traversal ----------

// Elements whose text should never be translated.
const SKIP_TAGS = new Set(["script", "style", "code", "pre", "kbd", "samp", "var"]);

async function translateHtmlFragment(html, to) {
  const root = parseHtml(html, { comment: true });

  // Collect all text nodes in document order that need translation.
  const tasks = [];
  function walk(node, inSkip) {
    if (!node || !node.childNodes) return;
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        // text node
        if (!inSkip) {
          const raw = child.rawText;
          const trimmed = raw.trim();
          if (trimmed && /\p{L}/u.test(trimmed)) {
            tasks.push({ node: child, raw });
          }
        }
      } else if (child.nodeType === 1) {
        const tag = (child.rawTagName || "").toLowerCase();
        walk(child, inSkip || SKIP_TAGS.has(tag));
      }
    }
  }
  walk(root, false);

  // Translate sequentially (throttled) so Google doesn't block us.
  for (const t of tasks) {
    const trimmed = t.raw.trim();
    const leading = t.raw.slice(0, t.raw.indexOf(trimmed));
    const trailing = t.raw.slice(t.raw.indexOf(trimmed) + trimmed.length);
    const translated = await translate(trimmed, to);
    t.node.rawText = leading + translated + trailing;
  }

  // Translate a handful of attribute values that are user-visible.
  const attrEls = root.querySelectorAll("[alt], [title], [placeholder], [aria-label]");
  for (const el of attrEls) {
    for (const attr of ["alt", "title", "placeholder", "aria-label"]) {
      const v = el.getAttribute(attr);
      if (v && v.trim() && /\p{L}/u.test(v)) {
        el.setAttribute(attr, await translate(v, to));
      }
    }
  }

  return root.toString();
}

// ---------- URL rewriting ----------

function prefixPath(urlPath, lang) {
  // Only touch local absolute paths like /tools/foo.html or /privacy.html
  if (!urlPath.startsWith("/")) return urlPath;
  // Don't double-prefix
  if (urlPath.startsWith(`/${lang}/`) || urlPath === `/${lang}`) return urlPath;
  // Skip non-page assets that should stay shared
  if (/^\/(assets|icons|manifest\.json|sw\.js|robots\.txt|sitemap\.xml|\.well-known)/.test(urlPath)) {
    return urlPath;
  }
  return `/${lang}${urlPath}`;
}

function rewriteInternalLinks(html, lang) {
  const root = parseHtml(html, { comment: true });
  for (const a of root.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href");
    if (!href) continue;
    if (href.startsWith("http://") || href.startsWith("https://")) continue;
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) continue;

    if (href.startsWith("/")) {
      a.setAttribute("href", prefixPath(href, lang));
    } else {
      // relative link like "tools/foo.html" — leave as-is; output folder is parallel
    }
  }
  return root.toString();
}

// ---------- file walking ----------

function findHtmlFiles(dir, base = SRC, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full);
    // Skip translated output folders, includes, data, passthrough assets.
    if (entry.isDirectory()) {
      if (["_includes", "_data", "assets", "icons", ".well-known"].includes(entry.name)) continue;
      if (/^[a-z]{2}(-[A-Z]{2})?$/.test(entry.name) && entry.name !== "en") continue; // skip other langs
      findHtmlFiles(full, base, out);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      out.push(rel);
    }
  }
  return out;
}

// ---------- per-page conversion ----------

async function translatePage(relPath) {
  const src = path.join(SRC, relPath);
  const dst = path.join(OUT_DIR, relPath);

  const raw = fs.readFileSync(src, "utf8");
  const parsed = matter(raw);
  const data = { ...parsed.data };

  // Front matter strings to translate
  const textFields = ["title", "description", "ogTitle", "ogDescription"];
  for (const f of textFields) {
    if (data[f] && typeof data[f] === "string") {
      data[f] = await translate(data[f], LANG);
    }
  }

  // Rewrite canonical
  if (data.canonical && typeof data.canonical === "string") {
    try {
      const u = new URL(data.canonical);
      u.pathname = prefixPath(u.pathname, LANG);
      data.canonical = u.toString();
    } catch {}
  }

  // JSON-LD: translate name + description, rewrite url
  if (data.jsonLd && typeof data.jsonLd === "string") {
    try {
      const obj = JSON.parse(data.jsonLd);
      async function walk(o) {
        if (Array.isArray(o)) {
          for (const x of o) await walk(x);
          return;
        }
        if (o && typeof o === "object") {
          if (typeof o.name === "string") o.name = await translate(o.name, LANG);
          if (typeof o.description === "string") o.description = await translate(o.description, LANG);
          if (typeof o.headline === "string") o.headline = await translate(o.headline, LANG);
          if (typeof o.url === "string" && o.url.startsWith("https://spinnit.site")) {
            try {
              const u = new URL(o.url);
              u.pathname = prefixPath(u.pathname, LANG);
              o.url = u.toString();
            } catch {}
          }
          for (const k of Object.keys(o)) {
            if (!["name", "description", "headline", "url"].includes(k)) await walk(o[k]);
          }
        }
      }
      await walk(obj);
      data.jsonLd = JSON.stringify(obj, null, 2);
    } catch (e) {
      console.warn(`  [jsonLd parse skip: ${e.message}]`);
    }
  }

  // extraHead: translate twitter title/description attribute values
  if (data.extraHead && typeof data.extraHead === "string") {
    const root = parseHtml(data.extraHead);
    for (const m of root.querySelectorAll("meta[content]")) {
      const name = (m.getAttribute("name") || m.getAttribute("property") || "").toLowerCase();
      if (/title|description/.test(name)) {
        const v = m.getAttribute("content");
        if (v && v.trim()) m.setAttribute("content", await translate(v, LANG));
      }
    }
    data.extraHead = root.toString();
  }

  // Body: rewrite internal links first, then translate text nodes
  let body = parsed.content;
  body = rewriteInternalLinks(body, LANG);
  body = await translateHtmlFragment(body, LANG);

  // Mark the language on the HTML element via front-matter hint
  data.lang = LANG;

  // Write
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, matter.stringify(body, data));
  saveCache();
}

// ---------- main ----------

(async () => {
  const files = findHtmlFiles(SRC).filter((f) => !FILTER || f.includes(FILTER));
  console.log(`Translating ${files.length} page(s) to '${LANG}'…\n`);

  let i = 0;
  for (const f of files) {
    i++;
    process.stdout.write(`[${i}/${files.length}] ${f}\n`);
    try {
      await translatePage(f);
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
    }
  }
  saveCache();
  console.log(`\nDone. Output: src/${LANG}/`);
})();
