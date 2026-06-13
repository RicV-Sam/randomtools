# AI Indexability Report

Date: 2026-06-13

## Summary

- English AI source pages found: 38
- Generated English AI pages: 37
- English AI pages added to sitemap: 36
- English AI pages added to SEO QA: 36
- English AI pages still excluded: 2 source pages
- Final sitemap AI URL count: 36
- Final sitemap URL count: 114

## Included

The sitemap now includes a deliberate allowlist of production English `/ai/` pages:

- `/ai/`
- `/ai/all-tools/`
- 4 best-tool pages
- 7 AI blog/guide pages
- 7 AI category pages
- 4 comparison pages
- `/ai/directory/`
- `/ai/how-we-review/`
- `/ai/picker/`
- `/ai/suggest-a-tool/`
- 8 individual AI tool pages

These pages have self-canonicals, one H1, meta descriptions, visible content, internal links, and no `noindex` directive.

## Excluded

- `/ai/404.html`: generated but `noindex`; not sitemap eligible.
- `src/ai/templates/page-template.html`: template only, `permalink: false`; not generated.
- `/ar/ai/**`: localized AI pages remain excluded from sitemap and generated SEO QA until translation/currentness QA approves them. Current QA skips 37 generated localized AI pages intentionally.
- `/de/**`: still excluded from sitemap unless separately approved.

## Fixes Made

- Replaced broad `/ai/` sitemap exclusion with an explicit English AI sitemap allowlist.
- Updated SEO QA so English `/ai/` pages are checked as core organic pages.
- Kept localized AI pages specifically excluded instead of skipping all AI pages.
- Added schema-only `BreadcrumbList` output for English AI pages without duplicating visible breadcrumbs.
- Added `/ai/#categories` discovery links so category breadcrumbs and category pages are crawlable.
- Added an internal link to the productivity AI category from the AI directory.
- Changed visible `Updated for April 2026` labels to `Last reviewed: April 2026`.
- Made the AI review methodology description evergreen.

## Findings

- Duplicate title issues found: 0
- Duplicate H1 issues found: 0
- Noindex URLs in sitemap: 0
- Localized AI URLs in sitemap: 0
- English AI pages missing breadcrumb schema: 0

## Future Freshness Risks

The AI pages still contain pricing snapshot and free-plan language that should be manually refreshed before affiliate monetisation, stronger rankings, or additional AI content expansion. No new pricing, ratings, affiliate links, or review schema were added in this task.

## Validation

- `npm run build`: passed
- `npm run check:content`: passed
- SEO QA: passed with 262 generated HTML files, 8069 internal links, 114 sitemap URLs, and 37 localized AI pages skipped intentionally
- Sitemap assertions: 36 English AI URLs, 0 localized AI URLs, 0 `/de/` URLs, 0 noindex URLs
