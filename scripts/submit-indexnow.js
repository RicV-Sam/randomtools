#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SITE_URL = "https://spinnit.site";
const DEFAULT_SITEMAP = path.join(ROOT, "_site", "sitemap.xml");
const DEFAULT_ENDPOINT = "https://api.indexnow.org/indexnow";

function loadLocalEnv() {
  if (process.env.CI) return;
  for (const file of [".env.local", ".env"]) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    sitemap: DEFAULT_SITEMAP,
    siteUrl: process.env.INDEXNOW_SITE_URL || process.env.BING_SITE_URL || DEFAULT_SITE_URL,
    endpoint: process.env.INDEXNOW_ENDPOINT || DEFAULT_ENDPOINT,
    limit: Infinity,
    urls: [],
    urlsFile: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) throw new Error(`${arg} requires a value`);
      return argv[i];
    };

    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--sitemap") options.sitemap = next();
    else if (arg === "--site") options.siteUrl = next();
    else if (arg === "--endpoint") options.endpoint = next();
    else if (arg === "--limit") options.limit = parsePositiveInteger(next(), "--limit");
    else if (arg === "--url") options.urls.push(next());
    else if (arg === "--urls-file") options.urlsFile = next();
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function parsePositiveInteger(value, label) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`${label} must be a positive integer`);
  }
  return parsed;
}

function printHelp() {
  console.log(`Submit sitemap URLs through IndexNow.

Usage:
  node scripts/submit-indexnow.js [options]

Options:
  --dry-run             Print what would be submitted without calling IndexNow
  --sitemap <path|url>  Read URLs from a sitemap (default: _site/sitemap.xml)
  --site <url>          Site URL (default: https://spinnit.site)
  --endpoint <url>      IndexNow endpoint (default: https://api.indexnow.org/indexnow)
  --limit <number>      Submit at most this many URLs
  --url <url>           Submit one explicit URL; can be repeated
  --urls-file <path>    Read one URL per line, ignoring blank lines and # comments

Environment:
  INDEXNOW_API_KEY is required unless --dry-run is used.
`);
}

function indexNowKey() {
  return process.env.INDEXNOW_API_KEY || "";
}

async function readText(source) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Failed to fetch ${source}: HTTP ${response.status}`);
    return response.text();
  }

  const file = path.resolve(ROOT, source);
  if (!fs.existsSync(file)) {
    throw new Error(`${file} does not exist; run npm run build first or pass --sitemap <url>`);
  }
  return fs.readFileSync(file, "utf8");
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'");
}

async function readSitemapUrls(source) {
  const xml = await readText(source);
  return Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)).map((match) => decodeXml(match[1].trim()));
}

function readUrlsFile(file) {
  const full = path.resolve(ROOT, file);
  if (!fs.existsSync(full)) throw new Error(`${full} does not exist`);
  return fs
    .readFileSync(full, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function prepareUrls(urls, siteUrl, limit) {
  const siteOrigin = new URL(siteUrl).origin;
  const seen = new Set();
  const cleaned = [];

  for (const raw of urls) {
    const url = new URL(raw);
    if (url.origin !== siteOrigin) {
      throw new Error(`URL is outside ${siteOrigin}: ${raw}`);
    }
    const normalized = url.toString();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    cleaned.push(normalized);
    if (cleaned.length >= limit) break;
  }

  return cleaned;
}

async function main() {
  const { submitIndexNow } = await import("./lib/indexnow-client.mjs");
  loadLocalEnv();
  const options = parseArgs(process.argv.slice(2));
  const key = indexNowKey().trim();

  const rawUrls = options.urls.length > 0 ? options.urls : await readSitemapUrls(options.sitemap);
  if (options.urlsFile) rawUrls.push(...readUrlsFile(options.urlsFile));

  const urls = prepareUrls(rawUrls, options.siteUrl, options.limit);
  await submitIndexNow({ endpoint: options.endpoint, host: new URL(options.siteUrl).host,
    key, keyLocation: `${new URL(options.siteUrl).origin}/${key}.txt`, urls, dryRun: options.dryRun });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
