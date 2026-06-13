#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SITE_URL = "https://spinnit.site";
const DEFAULT_SITEMAP = path.join(ROOT, "_site", "sitemap.xml");
const API_BASE = "https://ssl.bing.com/webmaster/api.svc/json";
const MAX_BATCH_SIZE = 500;

function loadLocalEnv() {
  if (process.env.CI) return;
  for (const file of [".env.local", ".env"]) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    const lines = fs.readFileSync(full, "utf8").split(/\r?\n/);
    for (const line of lines) {
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
    siteUrl: process.env.BING_SITE_URL || DEFAULT_SITE_URL,
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
  console.log(`Submit sitemap URLs to Bing Webmaster URL Submission API.

Usage:
  node scripts/submit-bing.js [options]

Options:
  --dry-run             Print what would be submitted without calling Bing
  --sitemap <path|url>  Read URLs from a sitemap (default: _site/sitemap.xml)
  --site <url>          Verified Bing Webmaster site URL (default: https://spinnit.site)
  --limit <number>      Submit at most this many URLs
  --url <url>           Submit one explicit URL; can be repeated
  --urls-file <path>    Read one URL per line, ignoring blank lines and # comments

Environment:
  BING_WEBMASTER_API_KEY or BING_API_KEY is required unless --dry-run is used.
  BING_SITE_URL can override the default verified site URL.
`);
}

async function readText(source) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${source}: HTTP ${response.status}`);
    }
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

function normalizeOrigin(value) {
  const parsed = new URL(value);
  return parsed.origin;
}

function prepareUrls(urls, siteUrl, limit) {
  const siteOrigin = normalizeOrigin(siteUrl);
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

function apiUrl(method, apiKey, params = {}) {
  const url = new URL(`${API_BASE}/${method}`);
  url.searchParams.set("apikey", apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

async function bingRequest(method, apiKey, options = {}) {
  const response = await fetch(apiUrl(method, apiKey, options.params), {
    method: options.body ? "POST" : "GET",
    headers: options.body ? { "content-type": "application/json; charset=utf-8" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  let json = null;
  if (text.trim()) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    const detail = json ? JSON.stringify(json) : text.trim();
    throw new Error(`Bing ${method} failed with HTTP ${response.status}${detail ? `: ${detail}` : ""}`);
  }

  return json;
}

async function getQuota(apiKey, siteUrl) {
  const data = await bingRequest("GetUrlSubmissionQuota", apiKey, {
    params: { siteUrl },
  });
  const quota = data && data.d ? data.d : data;
  const daily = Number(quota && quota.DailyQuota);
  const monthly = Number(quota && quota.MonthlyQuota);
  return {
    daily: Number.isFinite(daily) ? daily : Infinity,
    monthly: Number.isFinite(monthly) ? monthly : Infinity,
  };
}

function chunks(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function submitBatch(apiKey, siteUrl, urlList) {
  await bingRequest("SubmitUrlbatch", apiKey, {
    body: { siteUrl, urlList },
  });
}

async function main() {
  loadLocalEnv();
  const options = parseArgs(process.argv.slice(2));
  const apiKey = process.env.BING_WEBMASTER_API_KEY || process.env.BING_API_KEY;

  if (!apiKey && !options.dryRun) {
    throw new Error("BING_WEBMASTER_API_KEY is required; add it locally or as a GitHub Actions secret");
  }

  const rawUrls = options.urls.length > 0 ? options.urls : await readSitemapUrls(options.sitemap);
  if (options.urlsFile) rawUrls.push(...readUrlsFile(options.urlsFile));

  const urls = prepareUrls(rawUrls, options.siteUrl, options.limit);
  if (urls.length === 0) {
    console.log("No Bing URLs to submit.");
    return;
  }

  if (options.dryRun) {
    console.log(`Bing dry run: ${urls.length} URL(s) from ${options.siteUrl}`);
    for (const url of urls.slice(0, 20)) console.log(`- ${url}`);
    if (urls.length > 20) console.log(`...and ${urls.length - 20} more`);
    return;
  }

  const quota = await getQuota(apiKey, options.siteUrl);
  const allowance = Math.min(urls.length, quota.daily, quota.monthly);
  if (allowance < 1) {
    console.log(`Bing quota is exhausted for ${options.siteUrl}. Daily: ${quota.daily}, monthly: ${quota.monthly}`);
    return;
  }

  const submitUrls = urls.slice(0, allowance);
  const batches = chunks(submitUrls, MAX_BATCH_SIZE);
  for (let i = 0; i < batches.length; i += 1) {
    await submitBatch(apiKey, options.siteUrl, batches[i]);
    console.log(`Submitted Bing batch ${i + 1}/${batches.length} (${batches[i].length} URL(s))`);
  }

  console.log(`Submitted ${submitUrls.length} URL(s) to Bing for ${options.siteUrl}.`);
  if (submitUrls.length < urls.length) {
    console.log(`Skipped ${urls.length - submitUrls.length} URL(s) because of quota or --limit.`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
