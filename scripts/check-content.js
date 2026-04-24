#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const SITE_URL = "https://spinnit.site";

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function fail(list, file, message) {
  list.push(`${path.relative(ROOT, file)}: ${message}`);
}

function checkJsonLd(errors, file, data) {
  if (typeof data.jsonLd === "string") {
    try {
      JSON.parse(data.jsonLd);
    } catch (e) {
      fail(errors, file, `invalid front-matter jsonLd (${e.message})`);
    }
  }

  if (typeof data.extraHead === "string") {
    const rx = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = rx.exec(data.extraHead))) {
      try {
        JSON.parse(m[1]);
      } catch (e) {
        fail(errors, file, `invalid extraHead JSON-LD (${e.message})`);
      }
    }
  }
}

function checkGermanLocale(errors, file, data) {
  const rel = path.relative(SRC, file).replace(/\\/g, "/");
  if (!rel.startsWith("de/")) return;

  if (typeof data.navBackHref === "string" && data.navBackHref.startsWith("/") && !data.navBackHref.startsWith("/de/")) {
    fail(errors, file, `navBackHref must stay in /de/ namespace (found "${data.navBackHref}")`);
  }

  if (typeof data.jsonLd === "string") {
    try {
      const obj = JSON.parse(data.jsonLd);
      const stack = [obj];
      while (stack.length) {
        const node = stack.pop();
        if (!node || typeof node !== "object") continue;
        for (const [k, v] of Object.entries(node)) {
          if (typeof v === "string") {
            if ((k.toLowerCase().includes("url") || k === "mainEntityOfPage") &&
              v.startsWith(`${SITE_URL}/`) &&
              !v.startsWith(`${SITE_URL}/de/`)) {
              fail(errors, file, `${k} should point to localized /de/ URL (found "${v}")`);
            }
          } else if (Array.isArray(v)) {
            for (const item of v) stack.push(item);
          } else if (v && typeof v === "object") {
            stack.push(v);
          }
        }
      }
    } catch {
      // handled by JSON-LD validation already
    }
  }
}

function main() {
  const files = walk(SRC);
  const errors = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    checkJsonLd(errors, file, data);
    checkGermanLocale(errors, file, data);
  }

  if (errors.length) {
    console.error(`check-content failed with ${errors.length} issue(s):`);
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  console.log(`check-content passed (${files.length} HTML files checked)`);
}

main();
