# AI Commercial Readiness Report

Date: 2026-06-13

## Scope

- Reviewed the 39 English AI URLs currently allowed in the sitemap.
- Confirmed the localized AI pages remain outside the sitemap strategy and were not expanded.
- Focused on commercial-readiness risks: stale pricing language, free-plan claims, affiliate disclosure, external link qualification, review schema risk, and internal trust links.
- Did not add affiliate links, localized AI pages, new AI content clusters, fake ratings, Review schema, AggregateRating schema, or invented pricing.

## Pages Reviewed

All indexable English `/ai/` pages from the sitemap allowlist were reviewed:

- `/ai/`
- `/ai/all-tools/`
- `/ai/best/`
- `/ai/best/best-ai-tools-for-content-creators.html`
- `/ai/best/best-ai-tools-for-productivity.html`
- `/ai/best/best-ai-tools-for-small-business.html`
- `/ai/best/best-ai-tools-for-students.html`
- `/ai/blog/best-ai-tools-for-marketing-teams.html`
- `/ai/blog/best-ai-tools-for-research-workflows.html`
- `/ai/blog/best-ai-tools-for-solopreneurs.html`
- `/ai/blog/best-free-ai-tools-2026.html`
- `/ai/blog/chatgpt-alternatives-worth-trying.html`
- `/ai/blog/how-to-choose-the-right-ai-tool.html`
- `/ai/blog/which-ai-tool-should-you-pay-for-first.html`
- `/ai/categories/ai-audio-tools.html`
- `/ai/categories/ai-coding-tools.html`
- `/ai/categories/ai-image-tools.html`
- `/ai/categories/ai-productivity-tools.html`
- `/ai/categories/ai-research-tools.html`
- `/ai/categories/ai-video-tools.html`
- `/ai/categories/ai-writing-tools.html`
- `/ai/compare/`
- `/ai/compare/chatgpt-vs-claude.html`
- `/ai/compare/chatgpt-vs-perplexity.html`
- `/ai/compare/claude-vs-gemini.html`
- `/ai/compare/midjourney-vs-runway.html`
- `/ai/directory/`
- `/ai/how-we-review/`
- `/ai/picker/`
- `/ai/suggest-a-tool/`
- `/ai/tools/`
- `/ai/tools/chatgpt.html`
- `/ai/tools/claude.html`
- `/ai/tools/cursor.html`
- `/ai/tools/elevenlabs.html`
- `/ai/tools/gemini.html`
- `/ai/tools/midjourney.html`
- `/ai/tools/perplexity.html`
- `/ai/tools/runway.html`

## Changes Made

- Added a reusable English AI commercial note through the shared layout. It appears on English `/ai/` pages and tells readers that AI tools, plan names, free limits, features and pricing can change quickly.
- Linked the reusable note to `/ai/how-we-review/` and `/affiliate-disclosure.html` to strengthen AI trust and disclosure discovery.
- Replaced brittle "pricing snapshot" wording with "pricing note" or "plan note" language.
- Changed tool review sidebar labels from "Free plan" to "Plan snapshot" and replaced hard free-plan evaluations with "Confirm current provider limits".
- Changed "Free version quality" verdict bullets to "Free-first test" language on individual tool review pages.
- Softened comparison pages so free access and pricing are framed as changeable provider details rather than static facts.
- Changed directory table headers from "Free Plan" to "Entry option snapshot" and added a clear provider-verification note.
- Changed category table headers from "Free option" to "Entry option snapshot".
- Strengthened `/ai/how-we-review/` with a clearer "plan note" definition and commercial-disclosure standard.
- Added an AI-specific section to `/affiliate-disclosure.html`.

## Pages Changed

Source pages changed directly:

- `/ai/`
- `/ai/all-tools/`
- `/ai/best/best-ai-tools-for-content-creators.html`
- `/ai/best/best-ai-tools-for-productivity.html`
- `/ai/best/best-ai-tools-for-small-business.html`
- `/ai/best/best-ai-tools-for-students.html`
- `/ai/blog/best-ai-tools-for-marketing-teams.html`
- `/ai/blog/best-ai-tools-for-research-workflows.html`
- `/ai/blog/best-free-ai-tools-2026.html`
- `/ai/blog/which-ai-tool-should-you-pay-for-first.html`
- `/ai/categories/ai-audio-tools.html`
- `/ai/categories/ai-coding-tools.html`
- `/ai/categories/ai-image-tools.html`
- `/ai/categories/ai-productivity-tools.html`
- `/ai/categories/ai-research-tools.html`
- `/ai/categories/ai-video-tools.html`
- `/ai/categories/ai-writing-tools.html`
- `/ai/compare/chatgpt-vs-claude.html`
- `/ai/compare/chatgpt-vs-perplexity.html`
- `/ai/compare/claude-vs-gemini.html`
- `/ai/compare/midjourney-vs-runway.html`
- `/ai/directory/`
- `/ai/how-we-review/`
- `/ai/tools/chatgpt.html`
- `/ai/tools/claude.html`
- `/ai/tools/cursor.html`
- `/ai/tools/elevenlabs.html`
- `/ai/tools/gemini.html`
- `/ai/tools/midjourney.html`
- `/ai/tools/perplexity.html`
- `/ai/tools/runway.html`

The shared AI commercial note affects all 39 English AI URLs at render time.

## Link and Schema QA

- External AI provider links use `target="_blank"` with `rel="noopener sponsored nofollow"`.
- No new affiliate links were added.
- No affiliate tracking patterns were found in `/ai/`.
- No Review or AggregateRating schema was added.
- AI trust links now point readers toward the methodology, affiliate disclosure and privacy policy.

## Validation

Final validation passed:

- `npm run build` passed; Eleventy wrote 266 files.
- `npm run check:content` passed.
- `check-content` passed with 267 HTML files checked.
- `check-seo` passed with 265 HTML files, 8,520 internal links, 117 sitemap URLs, and 37 localized AI pages skipped intentionally.
- `git diff --check` passed with line-ending warnings only.
- Sitemap URL count: 117.
- English AI sitemap URLs: 39.
- Localized AI sitemap URLs: 0.
- `/de/` sitemap URLs: 0.
- Noindex URLs in sitemap: 0.
- Rendered English AI pages with the reusable AI commercial note: 39.
- Browser sanity check passed on `/ai/tools/chatgpt.html`, `/ai/directory/`, and `/ai/how-we-review/`.

## Residual Risks

- AI provider pricing and feature limits can change faster than static pages can be reviewed.
- The directory still uses compact "Yes", "No" and "Limited" plan snapshots for browsing speed; the page now labels these as snapshots and tells readers to verify provider pages.
- Best-tool pages remain opinionated by design. The risk is mitigated with clearer methodology, plan caveats and avoidance of fake ratings or unsupported review schema.

## Recommended Next Task

Add a lightweight quarterly AI freshness checklist to the sprint workflow: re-scan AI pages for pricing/free-plan terms, verify external rel attributes, check for accidental affiliate links or rating schema, and update `dateModified` only on pages materially reviewed.
