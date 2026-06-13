#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE_DIR = path.join(ROOT, "_site");

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

function indexNowKey() {
  return process.env.INDEXNOW_API_KEY || "";
}

function assertSafeKey(key) {
  if (!key) throw new Error("INDEXNOW_API_KEY is required");
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(key)) {
    throw new Error("INDEXNOW_API_KEY contains characters that are unsafe for a public key file name");
  }
}

function main() {
  loadLocalEnv();
  const key = indexNowKey().trim();
  assertSafeKey(key);

  if (!fs.existsSync(SITE_DIR)) {
    throw new Error("_site is missing; run npm run build first");
  }

  const keyFile = path.join(SITE_DIR, `${key}.txt`);
  fs.writeFileSync(keyFile, key, "utf8");
  console.log(`Wrote IndexNow key file to _site/${key}.txt`);
}

main();
