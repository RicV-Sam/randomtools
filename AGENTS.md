# Spinnit project instructions

## Purpose and priorities
- Spinnit (`https://spinnit.site`) helps complete beginners, especially adults 50+, use AI safely for everyday tasks. Practical learning is the primary direction; preserve the established random tools, guides and AI directory as supporting resources.
- This is an Eleventy 3 static site using Nunjucks, HTML, CSS and browser JavaScript, hosted on GitHub Pages. There is no production backend or database.
- Prefer calm, plain language, concrete tasks, readable controls and clear safety limits. Avoid invented expertise, ratings, reviews, learner results or accreditation.

## Where changes belong
- `src/` contains authored pages. `.html` files are Nunjucks templates with YAML front matter; `_site/` is generated output and must not be edited.
- `src/ai-for-over-50s/`: beginner guides, first-conversation practice, account guide and video companion.
- `src/learn/`: course hubs and lessons; `src/_data/learningCourses.json` owns stable course/level/lesson IDs, ordering and availability.
- `src/tools/`, `src/blog/`, `src/ai/`: browser tools, guides and AI Tool Radar directory/comparisons. `src/de/` and `src/ar/` contain reviewed/static locale work.
- `src/_includes/layouts/base.njk` owns the shared shell and metadata; `layouts/lesson.njk` and `partials/learn/` provide lesson components. Paths here are relative to `src/_includes/`.
- `src/assets/` contains shared and feature assets; reuse learning styles and scope additions to their feature containers rather than changing global tool styles.
- `.eleventy.js` configures builds/copying; `src/src.11tydata.js` computes routing/locale data; `src/_data/site.json` holds site settings; `src/_data/pageLocales.js` controls locale discovery and sitemap eligibility.
- First-conversation content and account narration live in `src/_data/firstConversation.json` and `accountGuideNarration.json`; matching audio manifests and `scripts/learning-narration-config.json` connect reviewed text to static recordings.

## Local commands and completion checks
Use Node 20 (`.nvmrc`, also used by CI) and the committed npm lockfile.

```sh
npm ci                    # install locked dependencies
npm start                 # Eleventy local server
npm run watch             # rebuild on changes without a server
npm run check:learning    # narration integrity regression tests
npm run build             # narration verification, then Eleventy -> _site/
npm run check:content     # source checks, then generated SEO/internal-link checks
```

- Run checks in the CI order: `check:learning`, `build`, then `check:content`. The latter needs fresh `_site/` output; `npm start` alone does not run the narration gate.
- `npm run check:source` and `npm run check:seo` run the respective validation stages separately. There is no lint script.
- For user-facing changes, also check the affected pages on mobile and desktop, keyboard navigation, visible focus and overflow. Learning content must remain readable with JavaScript disabled or storage unavailable.
- Preserve uncommitted work. Review the final diff and report which commands actually ran; local build success does not establish deployment or search indexing.

## Routes, metadata and discovery
- Check existing tools, guides and course coverage before adding a page. Prefer improving a relevant existing page over duplicating its intent.
- Preserve established `.html` URLs. New directory routes use physical `index.html` sources and explicit permalinks; keep source paths, output paths, canonical URLs and internal links consistent.
- Source discovery scans `.html` pages, not arbitrary Markdown/Nunjucks pages. Do not assume a new `.md` page will enter locale/sitemap data.
- Keep title, description, canonical, accurate `dateModified` and applicable JSON-LD in page front matter. Use the shared metadata renderer and one descriptive H1; keep visible content and schema consistent.
- `/learn/` pages require direct `lang: en`, `noAlternates: true`, `publicationStatus` and `contentType` front matter. Lessons must agree with `learningCourses.json`; maintain stable IDs used by browser progress.
- Draft learning pages require direct `noindex: true`; `status: draft` alone has no indexing effect. Planned lessons must remain visibly labelled text without links to missing pages.
- Sitemap generation reads raw front matter: inherited `noindex` alone is insufficient for general sitemap exclusion. Review `pageLocales.js` allowlists/blocklists, including the English AI allowlist, when changing eligibility.
- Keep localised AI mirrors noindexed and out of the sitemap until a separate translation/currentness review approves them. Do not broaden locale allowlists or hreflang to incomplete pages.
- Keep important pages reachable through relevant hubs, navigation and related resources. Put tool interfaces before long SEO copy.

## Editorial, learning and media conventions
- Follow [editorial standards](src/editorial-standards/index.html): verify changing controls, prices, privacy behaviour and reporting routes against current provider or responsible public-body sources; include useful source links.
- Review dates mean details were checked. Update page dates for substantive verified changes; do not advance the global sitemap fallback to imply every page was refreshed.
- Label constructed examples as illustrative. Screenshots and account instructions need evidence; do not infer unverified registration steps or exact free-message allowances. See [account-guide evidence](docs/chatgpt-account-guide-evidence.md).
- Preserve ad-free learning behaviour, static exercises/answers, optional browser-local progress and clear completion states. Do not store prompt text, answers or identity in course progress, or treat listening/watching as completing practice.
- Keep learning controls accessible: native semantics, labelled inputs, 44px targets, reduced motion, text/state feedback and logical focus order.
- Narrated text, quiz feedback, recordings and template review hashes must agree. The build rejects stale/missing audio or unreviewed content/template changes. Use `scripts/generate-learning-narration.py` for generation/review; update review markers only after reviewing the affected content and narration.
- Video embeds require an explicit click, no autoplay and a usable normal link/transcript fallback. Keep large MP4 exports outside this repository. See [video companion notes](docs/first-conversation-video-lessons.md).
- Course localisation remains English-only until a reviewed pilot is approved. `scripts/translate.js` skips top-level `learn/`; do not assume it protects every beginner-guide directory.
- Follow [translation workflow](docs/translation-workflow.md) for locale maintenance. Review Arabic polish suggestions before applying; do not overwrite editorial improvements with broad machine translation. Keep credentials in ignored local env files.
- `src/sw.js` caches non-navigation assets without revalidation. Changed learning CSS/JS needs a cache-aware versioned URL update and controlled-browser verification to avoid stale assets.

## Publishing and authoritative references
- [README](README.md) requires review before pushing directly to `main`. Do not infer new approval gates from historical phase proposals.
- [PR checks](.github/workflows/ci.yml) run installation, narration tests, build and content/SEO checks. [Deployment](.github/workflows/deploy.yml) runs on pushes to `main` or manual dispatch, uploads `_site/` and publishes GitHub Pages.
- Deployment can submit live sitemap URLs to Bing and IndexNow when secrets are configured. These are external side effects, not routine local validation; keep Bing's private API key distinct from the public IndexNow key.
- [Education brief](docs/spinnit-education-repositioning-and-course-implementation-brief.md) records strategy; [phase-one plan](docs/spinnit-education-phase-1-implementation-plan.md) explains course architecture. Their implementation snapshots are historical: use current source/configuration for existing layouts, tests, ads and service-worker behaviour.
- [First-conversation implementation](docs/first-conversation-pilot-implementation.md) and [parent test](docs/first-conversation-parent-test.md) describe the practice experience and learner validation. Historical one-off release authorisations do not authorise unrelated releases.

