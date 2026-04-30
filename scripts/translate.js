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
const { spawn } = require("child_process");
const matter = require("gray-matter");
const { parse: parseHtml } = require("node-html-parser");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const CACHE_DIR = path.join(ROOT, ".translation-cache");
const LANGUAGES_FILE = path.join(SRC, "_data", "languages.json");
const LANGUAGE_DIRS = fs.existsSync(LANGUAGES_FILE)
  ? new Set(JSON.parse(fs.readFileSync(LANGUAGES_FILE, "utf8")).available.map((l) => l.code).filter((code) => code !== "en"))
  : new Set();

const LANG = process.argv[2];
const FILTER = process.argv[3]; // optional substring match on relative path
const RTL_LANGS = new Set(["ar", "fa", "he", "ur"]);

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

let googleTranslate = null;
async function translateWithGoogle(text, to) {
  if (!googleTranslate) {
    const mod = await import("@vitalets/google-translate-api");
    googleTranslate = mod.translate;
  }
  const result = await googleTranslate(text, { to });
  return result.text;
}

// ---------- translate primitive: Argos via persistent Python subprocess ----------

let argosProc = null;
let argosQueue = []; // {resolve, reject}
let argosBuffer = "";
let argosReady = null;

function startArgos(from, to) {
  argosProc = spawn("python", [path.join(__dirname, "argos_server.py"), from, to], {
    stdio: ["pipe", "pipe", "pipe"],
  });
  argosProc.stderr.on("data", (d) => process.stderr.write(d));
  argosProc.on("exit", (code) => {
    if (argosQueue.length) {
      const err = new Error(`argos exited with code ${code}`);
      argosQueue.forEach((q) => q.reject(err));
      argosQueue = [];
    }
  });

  argosProc.stdout.on("data", (chunk) => {
    argosBuffer += chunk.toString("utf8");
    let idx;
    while ((idx = argosBuffer.indexOf("\n")) !== -1) {
      const line = argosBuffer.slice(0, idx);
      argosBuffer = argosBuffer.slice(idx + 1);
      const q = argosQueue.shift();
      if (!q) continue;
      try {
        const text = Buffer.from(line, "base64").toString("utf8");
        q.resolve(text);
      } catch (e) {
        q.reject(e);
      }
    }
  });

  // Wait for "[argos] ready" on stderr before accepting work
  argosReady = new Promise((resolve) => {
    let buf = "";
    const onData = (d) => {
      buf += d.toString();
      if (buf.includes("[argos] ready")) {
        argosProc.stderr.off("data", onData);
        resolve();
      }
    };
    argosProc.stderr.on("data", onData);
  });
}

function argosTranslate(text) {
  return new Promise((resolve, reject) => {
    argosQueue.push({ resolve, reject });
    const b64 = Buffer.from(text, "utf8").toString("base64");
    argosProc.stdin.write(b64 + "\n");
  });
}

// Strings that look like identifiers, URLs, emails, or code-like tokens.
const SKIP_PATTERN = /^(https?:\/\/|mailto:|tel:|#|\/|[\w.+-]+@[\w.-]+\.\w+$)/i;
const TECHNICAL_STRING_PATTERN = /^([#.][\w-]+|[\w-]+|[A-Z0-9_]+|text\/[\w.+-]+|application\/[\w.+-]+)$/;

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

async function translate(text, to) {
  if (!text || !text.trim()) return text;
  if (SKIP_PATTERN.test(text.trim())) return text;
  const key = `${to}:${text}`;
  if (cache[key]) return cache[key];

  // Argos chokes on HTML entities; decode before sending.
  const decoded = decodeEntities(text);

  try {
    const out = await translateWithGoogle(decoded, to);
    cache[key] = out;
    cacheDirty = true;
    return out;
  } catch (e) {
    console.error(`  [google failed: ${e.message}] trying argos`);
  }

  try {
    const out = await argosTranslate(decoded);
    cache[key] = out;
    cacheDirty = true;
    return out;
  } catch (e) {
    console.error(`  [argos failed: ${e.message}] keeping original`);
    return text;
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

function shouldTranslateJsLiteral(value, before) {
  const trimmed = value.trim();
  if (!trimmed || !/\p{L}/u.test(trimmed)) return false;
  if (SKIP_PATTERN.test(trimmed)) return false;
  if (TECHNICAL_STRING_PATTERN.test(trimmed)) {
    const visibleKeys = /(?:name|label|title|text|continent|capital|currency|region|message|error|question|answer)\s*:\s*$/;
    if (!visibleKeys.test(before.slice(-80))) return false;
  }
  if (/[<>{}$]/.test(trimmed)) return false;

  const technicalContext = /(getElementById|querySelector|querySelectorAll|addEventListener|createElement|setAttribute|getAttribute|removeAttribute|classList\.(?:add|remove|toggle|contains)|matches|closest)\s*\([^)]*$/;
  if (technicalContext.test(before.slice(-120))) return false;

  return true;
}

async function translateJsLiterals(js, to) {
  const literalPattern = /(["'`])((?:\\[\s\S]|(?!\1)[^\\])*)\1/g;
  const pieces = [];
  let lastIndex = 0;
  let match;

  while ((match = literalPattern.exec(js))) {
    const [full, quote, value] = match;
    const before = js.slice(0, match.index);
    pieces.push(js.slice(lastIndex, match.index));

    if (quote === "`" && /[$<>{}]/.test(value)) {
      pieces.push(full);
    } else if (shouldTranslateJsLiteral(value, before)) {
      const translated = await translate(value, to);
      const escaped = translated
        .replace(/\\/g, "\\\\")
        .replace(new RegExp(quote, "g"), `\\${quote}`)
        .replace(/\r?\n/g, "\\n");
      pieces.push(`${quote}${escaped}${quote}`);
    } else {
      pieces.push(full);
    }

    lastIndex = literalPattern.lastIndex;
  }

  pieces.push(js.slice(lastIndex));
  return pieces.join("");
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

function localizeSiteUrl(value, lang) {
  if (typeof value !== "string") return value;
  if (!value.startsWith("https://spinnit.site")) return value;
  try {
    const u = new URL(value);
    u.pathname = prefixPath(u.pathname, lang);
    return u.toString();
  } catch {
    return value;
  }
}

async function translateStructuredObject(o, lang) {
  if (Array.isArray(o)) {
    for (let i = 0; i < o.length; i++) {
      o[i] = await translateStructuredObject(o[i], lang);
    }
    return o;
  }
  if (!o || typeof o !== "object") return o;

  for (const k of Object.keys(o)) {
    const v = o[k];
    if (typeof v === "string") {
      // Translate human-facing text fields.
      if (["name", "description", "headline", "text"].includes(k)) {
        o[k] = await translate(v, lang);
        continue;
      }
      // Keep structured URLs locale-aware.
      if (k.toLowerCase().includes("url") || k === "mainEntityOfPage") {
        o[k] = localizeSiteUrl(v, lang);
        continue;
      }
      o[k] = v;
      continue;
    }
    o[k] = await translateStructuredObject(v, lang);
  }
  return o;
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
      if (LANGUAGE_DIRS.has(entry.name)) continue; // skip translated output folders
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
  const textFields = ["title", "description", "ogTitle", "ogDescription", "h1", "navBackLabel"];
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

  if (typeof data.permalink === "string" && data.permalink.startsWith("/")) {
    data.permalink = prefixPath(data.permalink, LANG);
  }

  // Rewrite locale-sensitive front matter links.
  if (typeof data.navBackHref === "string" && data.navBackHref.startsWith("/")) {
    data.navBackHref = prefixPath(data.navBackHref, LANG);
  }

  if (typeof data.pageScript === "string") {
    data.pageScript = await translateJsLiterals(data.pageScript, LANG);
  }

  // JSON-LD: translate name + description, rewrite url
  if (data.jsonLd && typeof data.jsonLd === "string") {
    try {
      const obj = JSON.parse(data.jsonLd);
      await translateStructuredObject(obj, LANG);
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
      const httpEquiv = (m.getAttribute("http-equiv") || "").toLowerCase();
      if (/title|description/.test(name)) {
        const v = m.getAttribute("content");
        if (v && v.trim()) m.setAttribute("content", await translate(v, LANG));
      } else if (/url/.test(name)) {
        const v = m.getAttribute("content");
        if (v) m.setAttribute("content", localizeSiteUrl(v, LANG));
      } else if (httpEquiv === "refresh") {
        const v = m.getAttribute("content");
        if (v) m.setAttribute("content", v.replace(/url=(\/[^;"']*)/i, (_match, url) => `url=${prefixPath(url, LANG)}`));
      }
    }

    for (const s of root.querySelectorAll('script[type="application/ld+json"]')) {
      const raw = (s.text || s.innerHTML || s.rawText || "").trim();
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        await translateStructuredObject(obj, LANG);
        s.set_content(JSON.stringify(obj, null, 2));
      } catch (e) {
        console.warn(`  [extraHead jsonLd parse skip: ${e.message}]`);
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
  if (RTL_LANGS.has(LANG)) data.dir = "rtl";

  // Write
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, matter.stringify(body, data));
  saveCache();
}

// ---------- main ----------

(async () => {
  startArgos("en", LANG);
  await argosReady;

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
  argosProc.stdin.end();
})();
