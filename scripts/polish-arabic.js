#!/usr/bin/env node
/**
 * Polish existing Arabic localization copy with OpenAI.
 *
 * This is a local maintenance tool, not part of the Eleventy build.
 *
 * Safe defaults:
 *   node scripts/polish-arabic.js --scan
 *   node scripts/polish-arabic.js --file index.html --limit 20
 *   node scripts/polish-arabic.js --file index.html --limit 20 --apply
 *
 * Required for API calls:
 *   OPENAI_API_KEY in .env.local, .env, or the shell environment.
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { parse: parseHtml } = require("node-html-parser");

const ROOT = path.resolve(__dirname, "..");
const SRC_AR = path.join(ROOT, "src", "ar");
const CACHE_DIR = path.join(ROOT, ".translation-cache");
const CACHE_FILE = path.join(CACHE_DIR, "ar-polish-openai.json");

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const SKIP_TAGS = new Set(["script", "style", "code", "pre", "kbd", "samp", "var"]);
const FRONT_MATTER_TEXT_FIELDS = ["title", "description", "ogTitle", "ogDescription", "h1", "navBackLabel"];
const USER_VISIBLE_ATTRS = ["alt", "title", "placeholder", "aria-label"];
const JSON_TEXT_KEYS = new Set(["name", "description", "headline", "text"]);
const PROTECTED_NAMES = [
  "Spinnit",
  "ChatGPT",
  "Claude",
  "Gemini",
  "Perplexity",
  "Midjourney",
  "Runway",
  "Cursor",
  "ElevenLabs",
  "OpenAI",
  "Google",
  "Microsoft",
  "Amazon",
  "D&D",
  "Pathfinder",
  "Warhammer",
  "UK Lotto",
  "EuroMillions",
  "Powerball",
  "HEX",
  "RGB",
  "HSL",
  "UUID",
  "NdX",
];

function normalizeKnownBrandText(text) {
  const trimmed = (text || "").trim();
  if (trimmed === "غزل") return "Spinn";
  if (trimmed === "هو - هي") return "it";
  return text.replace(/سبينيت/g, "Spinnit");
}

function parseArgs(argv) {
  const args = {
    apply: false,
    scan: false,
    file: "",
    limit: Infinity,
    batchSize: 25,
    model: DEFAULT_MODEL,
    out: path.join(ROOT, "arabic-polish-suggestions.json"),
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") args.apply = true;
    else if (a === "--scan") args.scan = true;
    else if (a === "--file") args.file = argv[++i] || "";
    else if (a === "--limit") args.limit = Number(argv[++i] || Infinity);
    else if (a === "--batch-size") args.batchSize = Number(argv[++i] || args.batchSize);
    else if (a === "--model") args.model = argv[++i] || args.model;
    else if (a === "--out") args.out = path.resolve(ROOT, argv[++i] || args.out);
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }

  if (!Number.isFinite(args.limit) || args.limit < 0) args.limit = Infinity;
  if (!Number.isFinite(args.batchSize) || args.batchSize < 1) args.batchSize = 25;
  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/polish-arabic.js --scan
  node scripts/polish-arabic.js [--file substring] [--limit n] [--batch-size n] [--model model] [--apply]

Options:
  --scan           Extract and count polishable Arabic text without calling OpenAI.
  --file value     Only process files whose path contains this value.
  --limit n        Limit number of text items sent to OpenAI.
  --batch-size n   Number of text items per OpenAI request. Default: 25.
  --model value    Model to use. Default: OPENAI_MODEL or ${DEFAULT_MODEL}.
  --out path       Dry-run suggestions JSON path. Default: arabic-polish-suggestions.json.
  --apply          Write improved text back to src/ar files. Without this, files are unchanged.
`);
}

function loadLocalEnv() {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(ROOT, name);
    if (!fs.existsSync(file)) continue;

    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) continue;

      const key = match[1];
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function walkHtml(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function hasArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

function shouldPolish(text) {
  const trimmed = (text || "").trim();
  if (!trimmed || !hasArabic(trimmed)) return false;
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(trimmed)) return false;
  if (/^[\d\s.,:;!?()[\]{}'"،؛؟%+-]+$/.test(trimmed)) return false;
  return true;
}

function addItem(items, file, kind, keyPath, value, setter) {
  if (!shouldPolish(value)) return;
  items.push({
    id: `${path.relative(ROOT, file).replace(/\\/g, "/")}::${kind}::${keyPath}`,
    file,
    kind,
    keyPath,
    original: value,
    setter,
  });
}

function collectJsonItems(items, file, ownerKind, keyPath, value, setter) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectJsonItems(items, file, ownerKind, `${keyPath}.${index}`, item, (next) => {
        value[index] = next;
      });
    });
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, child] of Object.entries(value)) {
    if (typeof child === "string" && JSON_TEXT_KEYS.has(key)) {
      addItem(items, file, ownerKind, `${keyPath}.${key}`, child, (next) => {
        value[key] = next;
      });
    } else if (child && typeof child === "object") {
      collectJsonItems(items, file, ownerKind, `${keyPath}.${key}`, child, (next) => {
        value[key] = next;
      });
    }
  }
}

function collectJsLiteralItems(items, file, js, setJs) {
  const replacements = [];
  const literalPattern = /(["'`])((?:\\[\s\S]|(?!\1)[^\\])*)\1/g;
  let match;

  while ((match = literalPattern.exec(js))) {
    const [full, quote, value] = match;
    if (quote === "`" && /[$<>{}]/.test(value)) continue;
    if (!shouldPolish(value)) continue;
    if (/[<>{}$]/.test(value)) continue;

    const idx = replacements.length;
    replacements.push({ start: match.index, end: match.index + full.length, quote, original: value, next: value });
    addItem(items, file, "pageScript", `literal.${idx}`, value, (next) => {
      replacements[idx].next = next;
    });
  }

  return () => {
    if (!replacements.length) return;
    let out = "";
    let last = 0;
    for (const rep of replacements) {
      out += js.slice(last, rep.start);
      const escaped = rep.next
        .replace(/\\/g, "\\\\")
        .replace(new RegExp(rep.quote, "g"), `\\${rep.quote}`)
        .replace(/\r?\n/g, "\\n");
      out += `${rep.quote}${escaped}${rep.quote}`;
      last = rep.end;
    }
    out += js.slice(last);
    setJs(out);
  };
}

function collectHtmlItems(items, file, html, setHtml) {
  const root = parseHtml(html, { comment: true });
  let textIndex = 0;

  function walk(node, inSkip) {
    if (!node || !node.childNodes) return;
    for (const child of node.childNodes) {
      if (child.nodeType === 3) {
        if (!inSkip && shouldPolish(child.rawText)) {
          const raw = child.rawText;
          const trimmed = raw.trim();
          const leading = raw.slice(0, raw.indexOf(trimmed));
          const trailing = raw.slice(raw.indexOf(trimmed) + trimmed.length);
          const idx = textIndex++;
          addItem(items, file, "bodyText", `text.${idx}`, trimmed, (next) => {
            child.rawText = leading + next + trailing;
          });
        }
      } else if (child.nodeType === 1) {
        const tag = (child.rawTagName || "").toLowerCase();
        walk(child, inSkip || SKIP_TAGS.has(tag));
      }
    }
  }

  walk(root, false);

  let attrIndex = 0;
  for (const el of root.querySelectorAll(USER_VISIBLE_ATTRS.map((a) => `[${a}]`).join(","))) {
    for (const attr of USER_VISIBLE_ATTRS) {
      const value = el.getAttribute(attr);
      if (!shouldPolish(value)) continue;
      const idx = attrIndex++;
      addItem(items, file, "bodyAttr", `${attr}.${idx}`, value, (next) => {
        el.setAttribute(attr, next);
      });
    }
  }

  return () => setHtml(root.toString());
}

function collectFile(file) {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  const data = { ...parsed.data };
  let body = parsed.content;
  const items = [];
  const finishers = [];

  for (const field of FRONT_MATTER_TEXT_FIELDS) {
    if (typeof data[field] === "string") {
      addItem(items, file, "frontMatter", field, data[field], (next) => {
        data[field] = next;
      });
    }
  }

  if (typeof data.pageScript === "string") {
    finishers.push(collectJsLiteralItems(items, file, data.pageScript, (next) => {
      data.pageScript = next;
    }));
  }

  if (typeof data.jsonLd === "string") {
    try {
      const obj = JSON.parse(data.jsonLd);
      collectJsonItems(items, file, "jsonLd", "jsonLd", obj, () => {});
      finishers.push(() => {
        data.jsonLd = JSON.stringify(obj, null, 2);
      });
    } catch {}
  }

  if (typeof data.extraHead === "string") {
    const head = parseHtml(data.extraHead);
    let metaIndex = 0;

    for (const meta of head.querySelectorAll("meta[content]")) {
      const name = (meta.getAttribute("name") || meta.getAttribute("property") || "").toLowerCase();
      if (!/title|description/.test(name)) continue;
      const value = meta.getAttribute("content");
      const idx = metaIndex++;
      addItem(items, file, "extraHeadMeta", `${name || "meta"}.${idx}`, value, (next) => {
        meta.setAttribute("content", next);
      });
    }

    for (const script of head.querySelectorAll('script[type="application/ld+json"]')) {
      const rawJson = (script.text || script.innerHTML || script.rawText || "").trim();
      if (!rawJson) continue;
      try {
        const obj = JSON.parse(rawJson);
        collectJsonItems(items, file, "extraHeadJsonLd", `extraHead.${metaIndex++}`, obj, () => {});
        finishers.push(() => script.set_content(JSON.stringify(obj, null, 2)));
      } catch {}
    }

    finishers.push(() => {
      data.extraHead = head.toString();
    });
  }

  finishers.push(collectHtmlItems(items, file, body, (next) => {
    body = next;
  }));

  return {
    file,
    items,
    write() {
      for (const finish of finishers) finish();
      fs.writeFileSync(file, matter.stringify(body, data), "utf8");
    },
  };
}

function chunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function extractOutputText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  const parts = [];
  for (const item of response.output || []) {
    for (const c of item.content || []) {
      if (c.type === "output_text" && typeof c.text === "string") parts.push(c.text);
    }
  }
  return parts.join("\n");
}

function stripJsonFence(text) {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
}

function protectedTokens(text) {
  const tokens = new Set();
  for (const name of PROTECTED_NAMES) {
    if (text.includes(name)) tokens.add(name);
  }
  for (const m of text.matchAll(/\$\{[^}]+\}|https?:\/\/\S+|\/[A-Za-z0-9_./#?=&%-]+|[0-9]+d[0-9]+|d[0-9]+/g)) {
    tokens.add(m[0]);
  }
  return [...tokens];
}

function validateSuggestion(original, next) {
  if (typeof next !== "string" || !next.trim()) return "empty suggestion";
  if (/[<>]/.test(next) && !/[<>]/.test(original)) return "introduced HTML angle brackets";
  for (const token of protectedTokens(original)) {
    if (!next.includes(token)) return `missing protected token "${token}"`;
  }
  return "";
}

async function polishBatch(batch, model, cache) {
  const uncached = [];
  const suggestions = new Map();

  for (const item of batch) {
    const normalized = normalizeKnownBrandText(item.original);
    if (normalized !== item.original) {
      suggestions.set(item.id, normalized);
      continue;
    }

    const key = `${model}:${item.original}`;
    if (cache[key]) suggestions.set(item.id, cache[key]);
    else uncached.push(item);
  }

  if (!uncached.length) return suggestions;

  const instructions = `You are an Arabic localization editor for Spinnit.
Rewrite existing Arabic website copy into natural, clear Modern Standard Arabic.

Rules:
- Return JSON only: [{"id":"...","text":"..."}].
- Keep every id exactly unchanged.
- Preserve meaning, numbers, URLs, variables, placeholders, and product names.
- Keep the brand name "Spinnit" exactly as "Spinnit"; if Arabic text translated it, fix it.
- Do not add HTML tags.
- Do not change code, paths, schema structure, or variables such as \${sum}.
- Use concise, natural UI Arabic for buttons, labels, alerts, and headings.
- Prefer trustworthy, simple MSA. Avoid literal machine-translation phrasing.`;

  const input = JSON.stringify(
    uncached.map((item) => ({
      id: item.id,
      context: `${item.kind}:${item.keyPath}`,
      text: item.original,
    })),
    null,
    2
  );

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      instructions,
      input,
      text: {
        format: {
          type: "json_schema",
          name: "arabic_polish_suggestions",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    id: { type: "string" },
                    text: { type: "string" },
                  },
                  required: ["id", "text"],
                },
              },
            },
            required: ["suggestions"],
          },
        },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI request failed: ${res.status} ${res.statusText} ${body.slice(0, 500)}`);
  }

  const body = await res.json();
  const text = extractOutputText(body);
  const parsed = JSON.parse(stripJsonFence(text));
  const returned = parsed.suggestions || [];
  const expectedIds = new Set(uncached.map((item) => item.id));

  for (const row of returned) {
    if (!expectedIds.has(row.id)) continue;
    const item = uncached.find((x) => x.id === row.id);
    const reason = validateSuggestion(item.original, row.text);
    if (reason) {
      console.warn(`  [skip] ${row.id}: ${reason}`);
      continue;
    }
    suggestions.set(row.id, row.text);
    cache[`${model}:${item.original}`] = row.text;
  }

  return suggestions;
}

function loadCache() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  if (!fs.existsSync(CACHE_FILE)) return {};
  return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
}

(async () => {
  try {
    loadLocalEnv();
    const args = parseArgs(process.argv.slice(2));

    const allFiles = walkHtml(SRC_AR).sort();
    const relFiles = allFiles.map((file) => ({
      file,
      rel: path.relative(SRC_AR, file).replace(/\\/g, "/"),
    }));
    const exactFile = args.file && relFiles.some((entry) => entry.rel === args.file);
    const files = relFiles
      .filter((entry) => {
        if (!args.file) return true;
        return exactFile ? entry.rel === args.file : entry.rel.includes(args.file);
      })
      .map((entry) => entry.file);

    const pages = files.map(collectFile);
    const allItems = pages.flatMap((page) => page.items).slice(0, args.limit);

    console.log(`Arabic polish scan: ${files.length} file(s), ${allItems.length} text item(s).`);

    if (args.scan) {
      const byKind = {};
      for (const item of allItems) byKind[item.kind] = (byKind[item.kind] || 0) + 1;
      console.log(JSON.stringify(byKind, null, 2));
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing. Add it to .env.local or your shell environment.");
    }

    const cache = loadCache();
    const suggestionRows = [];
    const suggestionMap = new Map();

    let done = 0;
    for (const batch of chunks(allItems, args.batchSize)) {
      done += batch.length;
      console.log(`Polishing ${done}/${allItems.length}...`);
      const result = await polishBatch(batch, args.model, cache);
      for (const [id, text] of result) suggestionMap.set(id, text);
    }

    for (const item of allItems) {
      const next = suggestionMap.get(item.id);
      if (!next || next === item.original) continue;
      suggestionRows.push({
        id: item.id,
        file: path.relative(ROOT, item.file).replace(/\\/g, "/"),
        kind: item.kind,
        before: item.original,
        after: next,
      });
      item.setter(next);
    }

    saveCache(cache);

    if (args.apply) {
      for (const page of pages) {
        if (page.items.some((item) => suggestionMap.has(item.id))) page.write();
      }
      console.log(`Applied ${suggestionRows.length} change(s). Review with git diff.`);
    } else {
      fs.writeFileSync(args.out, JSON.stringify(suggestionRows, null, 2), "utf8");
      console.log(`Dry run wrote ${suggestionRows.length} suggestion(s) to ${path.relative(ROOT, args.out)}.`);
      console.log("No source files were changed. Re-run with --apply after review.");
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
