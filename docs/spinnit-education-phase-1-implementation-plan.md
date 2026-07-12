# Spinnit Education Phase 1 Implementation Plan

**Status:** Phase 0 repository validation complete; Phase 1 is not authorised by this document
**Prepared:** 12 July 2026
**Repository baseline:** `main` at `5ba65c94f0f5dec28764e88da95282484c1af2d0`
**Strategic source of truth:** [Spinnit Education Repositioning and Course Implementation Brief](./spinnit-education-repositioning-and-course-implementation-brief.md)

---

## 1. Scope and outcome

This is the repository-grounded plan for Phase 1 only. It does not implement Phase 1.

Phase 1 will prove a small English-only learning architecture by delivering:

1. A `/learn/` hub.
2. An AI prompting course overview.
3. One complete Level 1 prototype lesson: **How AI responds to instructions**.
4. A reusable lesson layout and small Nunjucks component set.
5. Minimal, optional browser-local progress.
6. Draft course navigation that does not create unfinished routes.
7. Learning-specific source validation.
8. Safe sitemap and indexation behaviour.
9. Accessible, mobile-friendly, progressively enhanced output.

Phase 1 will not reposition the homepage or global navigation, build the Prompt Lab, create a Level 1 hub, publish the other Level 1 lessons, add accounts or payments, call a live AI API, or create translated course pages.

---

## 2. Repository baseline verified during Phase 0

| Item | Verified repository state |
| --- | --- |
| Branch and remote | `main`, tracking `origin/main`, 0 ahead / 0 behind at inspection |
| Commit | `5ba65c94f0f5dec28764e88da95282484c1af2d0` — `feat: add random emoji generator` |
| Working tree before Phase 0 docs | No tracked changes; one untracked `Spin logo.png` |
| Project runtime | `.nvmrc` pins Node 20; the Phase 0 shell is Node `v24.11.0` |
| Eleventy | Requested as `^3.0.0`; lockfile/install resolves `3.1.5` |
| Source and output | `src/` to `_site/`; HTML and Markdown use Nunjucks |
| Source HTML | 285 files: 144 English/non-localised, 95 Arabic, 46 German |
| English clusters | 67 files under `src/tools/`; 41 under `src/ai/` |
| Current generated output | 283 HTML files and 295 total files in `_site/` at inspection |
| SEO baseline | 14,476 internal links; 138 sitemap URLs; 37 localised AI pages intentionally skipped |
| Automated safeguards | `check-content.js`, generated-site `check-seo.js`, Eleventy build, and Git diff checks; no lint or unit-test script |

The handoff snapshot in the strategic brief matches the checkout on every material branch, commit, working-tree, source-count, generated-HTML, link, sitemap and locale count. Its “approximately 284 generated pages/files” figure is only approximate; the current precise split is 283 generated HTML files and 295 generated files of all types.

The untracked `Spin logo.png` remains outside this work. It must not be deleted, modified, staged or committed.

---

## 3. Strategic assumptions confirmed

The following approved assumptions match the repository:

- Spinnit is an established Eleventy 3 static site, not a greenfield application.
- It uses Nunjucks, static HTML/CSS/client JavaScript, GitHub Pages and GitHub Actions.
- There is a root-scope service worker and web app manifest.
- Bing submission, IndexNow, Google-backed translation maintenance and optional local/build-time Arabic polishing exist.
- There is no application backend or production database.
- Existing `.html` routes are deliberately preserved.
- `src/` is source and `_site/` is generated output.
- The base layout owns common metadata, canonical rendering, hreflang rendering, analytics, advertising, breadcrumbs, shared navigation and the footer.
- English AI, classroom and workplace sections exist and are credible supporting assets for the Learn / Choose / Use model.
- The stale global `sitemapLastmod` fallback is `2026-05-06`.
- Existing content and generated SEO checks are the main regression protection.
- English learning content should be validated before any localisation.

The strategic direction therefore fits the current technical foundation without a framework, backend, database or dependency change.

---

## 4. Factual corrections and implementation nuances

### 4.1 Routes and canonicals

- `src/src.11tydata.js` preserves the physical source path as an `.html` output. A source `index.html` produces an output `index.html` that is served at the directory-style URL.
- Canonicals are not generated automatically from `page.url`. `base.njk` emits a canonical only when the page supplies `canonical` front matter.
- The `absUrl` shortcode exists but is not currently used to supply page canonicals.
- `pageLocales.js` and `check-content.js` scan source `.html` files only. A new course page authored as `.md` or `.njk` would bypass current locale/sitemap source discovery unless those scripts were expanded.
- `pageLocales.js` derives a route from the physical source path, not an arbitrary front-matter permalink. Phase 1 source paths, explicit permalinks and canonicals must therefore remain congruent.

### 4.2 Sitemap and publication state

- General English canonical pages are added to the sitemap automatically unless they are `noindex` or otherwise excluded.
- The English AI cluster has a special allowlist; `/learn/` will use the general English rule.
- The brief’s example `status: draft` field has no current effect on robots metadata or sitemap inclusion.
- Sitemap logic reads raw page front matter. A `noindex` value inherited only from layout or directory data may not be visible to `pageLocales.js`.
- The global `2026-05-06` last-modified date is a fallback. It should not be advanced for every existing URL. Each published learning page should provide an accurate direct `dateModified`.

### 4.3 Layouts and navigation

- There is currently one shared layout, `src/_includes/layouts/base.njk`, and two shared partials, `nav.njk` and `footer.njk`. No course or lesson component system exists yet.
- The shared nav defaults its back link to “all tools” and `/tools/`. Learning pages need an explicit course-appropriate back target and label.
- The homepage sets `hideNav: true` and contains its own navigation markup. A future global Learn link would require coordinated changes to both the shared partial and the homepage.
- Computed visible breadcrumbs cover tools and blog pages; AI gets separate schema breadcrumbs. Learn pages need explicit breadcrumbs or new scoped logic. Phase 1 should use explicit breadcrumbs to avoid changing global route computation.
- The primary nav is already dense on narrow screens and does not wrap. Phase 1 should not add a global Learn link.

### 4.4 Localisation

- `pageLocales.js` safely detects an English page when a matching physical `.html` source exists.
- The broad translation command currently walks every English HTML directory other than internal/assets/locale directories. Without a guard, it would include `src/learn/` and could create prohibited German or Arabic course mirrors.
- English AI pages commonly use `noAlternates: true`. The English-only Phase 1 learning pages should do the same until a reviewed localisation pilot is authorised.

### 4.5 Service worker and manifest

- The service worker uses network-first behaviour for navigations and caches successful visited pages.
- Other same-origin GET requests, including CSS and JavaScript, are cache-first with no revalidation. Reusing a changed asset URL can leave a controlled browser on stale learning code.
- Service-worker registration is not in the base layout. It occurs on the homepage and a small number of tools. A first direct visit to `/learn/` will not necessarily install the worker, although a previously installed root worker can control learning pages.
- The manifest still describes “Spinnit — Random Tools”. That is legacy positioning, but changing it belongs with the later site-level repositioning rather than Phase 1.

### 4.6 Analytics, advertising and privacy

- GA4 measurement ID `G-1F50QF6G4B` is loaded globally by `base.njk`. There are no course-specific events and no second analytics system.
- The AdSense loader is also included globally, even when a page has no visible ad unit.
- The privacy policy covers Google measurement and advertising, but does not yet explain browser-local course progress.

### 4.7 Content and current proposition

- The homepage is utility-led and contains dedicated classroom and AI Tool Radar sections.
- A workplace hub exists and is linked from the tools index and long footer, but it is not a homepage category.
- The AI Tool Picker is a static decision guide, not an interactive Prompt Lab.
- The utility-led `README.md`, package description, site tagline, manifest, homepage, nav and footer are genuine legacy positioning. They should not be treated as Phase 1 defects or changed opportunistically.
- `README.md` describes deployment as check-before-build, but the workflow correctly builds before `check:content`. Because `check:content` includes SEO checks against `_site/`, build-before-check is the authoritative order.

---

## 5. Existing implementation to reuse

| Existing implementation | Phase 1 use |
| --- | --- |
| `layouts/base.njk` | Outer HTML shell, language/direction, viewport, title/description, canonical, JSON-LD hook, breadcrumbs, nav/footer and page extension hooks |
| Explicit `breadcrumbs` front matter | Visible breadcrumb trail and matching `BreadcrumbList` JSON-LD |
| `.hub-page`, `.hub-section`, `.hub-grid`, `.hub-card`, `.hub-note` | Learn hub and course-overview foundation |
| Global design tokens | Colours, typography, spacing, borders and radius values |
| Global `:focus-visible` rules | Keyboard focus for links, buttons and form controls |
| `.sr-only` | Additional screen-reader descriptions and status text |
| Existing button/form conventions | Visual reference for completion and exercise controls |
| `window.copySpinnitText` | Optional future copyable prompt template; not required for the first lesson |
| AI cards and content sections | Design reference only |

The complete `src/ai/assets/css/style.css` file should not be loaded on learning pages. It redefines global tokens, `body`, `.container`, `.section` and `.card`, which would couple the course to the AI directory and create selector collisions.

The global `bindGlobalShortcut` helper should not be used for lesson interaction because Space/Enter document shortcuts can conflict with form controls, disclosure widgets and assistive technology.

---

## 6. Proposed URLs and permalink format

| Purpose | Source file | Explicit output permalink | Public URL and canonical |
| --- | --- | --- | --- |
| Learning hub | `src/learn/index.html` | `/learn/index.html` | `https://spinnit.site/learn/` |
| Course overview | `src/learn/ai-prompting/index.html` | `/learn/ai-prompting/index.html` | `https://spinnit.site/learn/ai-prompting/` |
| Prototype lesson | `src/learn/ai-prompting/level-1/how-ai-responds/index.html` | `/learn/ai-prompting/level-1/how-ai-responds/index.html` | `https://spinnit.site/learn/ai-prompting/level-1/how-ai-responds/` |

This pattern uses established physical `index.html` conventions and trailing-slash canonicals while preserving every existing `.html` URL.

Phase 1 should not create `/learn/ai-prompting/level-1/`. That Level 1 hub is reserved for Phase 2. The prototype breadcrumb should therefore be:

`Home > Learn AI > AI Prompting Course > How AI responds to instructions`

It must not contain a linked Level 1 crumb pointing to a route that does not exist.

---

## 7. Proposed content and data structure

### 7.1 Central course outline

Add `src/_data/learningCourses.json` as the navigation and course-outline source. Stable IDs are separate from display labels and URLs.

```json
{
  "aiPrompting": {
    "id": "ai-prompting",
    "title": "AI Prompting: Beginner to Applied Workflows",
    "shortTitle": "AI Prompting",
    "url": "/learn/ai-prompting/",
    "levels": [
      {
        "id": "level-1",
        "number": 1,
        "title": "Prompting Basics",
        "outcome": "Write a clear, safe and structured prompt for an everyday task.",
        "lessons": [
          {
            "id": "how-ai-responds",
            "number": 1,
            "title": "How AI responds to instructions",
            "estimatedMinutes": 10,
            "publicationStatus": "published",
            "url": "/learn/ai-prompting/level-1/how-ai-responds/"
          },
          {
            "id": "anatomy-of-a-useful-prompt",
            "number": 2,
            "title": "The anatomy of a useful prompt",
            "estimatedMinutes": 10,
            "publicationStatus": "planned",
            "url": null
          }
        ]
      }
    ]
  }
}
```

The real file should list all five approved Level 1 lesson titles so the course overview is honest about the planned sequence. Only `published` items may have a URL or render as links. `planned` items render as text with a visible “Coming later” label. They do not create source files, canonicals or sitemap entries.

### 7.2 Direct lesson front matter

Indexing-critical data must be present directly in the lesson source, not inherited only from directory or layout data.

```yaml
layout: layouts/lesson.njk
title: "How AI Responds to Instructions | AI Prompting Course | Spinnit"
description: "Learn why clear AI instructions matter by comparing a vague request with a prompt that states a useful outcome."
canonical: "https://spinnit.site/learn/ai-prompting/level-1/how-ai-responds/"
permalink: "/learn/ai-prompting/level-1/how-ai-responds/index.html"
dateModified: "YYYY-MM-DD"
lang: en
noAlternates: true
publicationStatus: published
contentType: lesson
courseId: ai-prompting
levelId: level-1
levelNumber: 1
levelTitle: Prompting Basics
lessonId: how-ai-responds
lessonNumber: 1
estimatedMinutes: 10
learningObjectives:
  - Explain why AI cannot infer every unstated goal.
  - Distinguish a vague request from a clear task.
  - Identify why a fluent answer can still require verification.
navBackHref: /learn/ai-prompting/
navBackLabel: AI Prompting course
```

The page should also contain explicit breadcrumbs, a structured `promptMakeover` object and an `exercise` object for the shared partials. Unique title, description, H1, canonical and dates stay page-owned so the existing source and generated checks can inspect them.

### 7.3 Prototype lesson content

The prototype must fully implement Lesson 1 from the strategic brief:

1. Answer-first introduction explaining that AI responds to supplied information and instructions.
2. Learning objectives and estimated time.
3. A plain-language explanation that AI does not automatically know an unstated goal.
4. A clearly labelled illustrative weak prompt.
5. A “What is missing?” activity.
6. A step-by-step Prompt Makeover:
   - Original prompt
   - What is missing
   - Improved prompt
   - Why it is better
   - What still needs checking
7. A practical comparison between an ambiguous request and a task with a clear outcome.
8. Immediate static feedback or model answer, available without JavaScript.
9. A short knowledge check.
10. A reminder that fluent language does not guarantee factual accuracy.
11. A reusable takeaway/template.
12. Course navigation, completion control and relevant supporting resources.

Constructed scenarios must be labelled “illustrative example”. The lesson must not claim genuine learner provenance, accreditation, perfect prompting or prevention of AI errors.

### 7.4 Static-first exercise approach

Use semantic HTML as the baseline:

- `fieldset`, `legend`, labels and native inputs for a knowledge check.
- `details` / `summary` for a model answer that remains available without JavaScript.
- A normal link-based lesson journey.
- No essential text inserted only by JavaScript.

JavaScript may enhance feedback and progress, but disabling JavaScript or storage must not remove the concept, exercise, answer, takeaway or navigation.

---

## 8. Reusable lesson layout and components

### `layouts/lesson.njk`

The new lesson layout should chain into `layouts/base.njk` and own:

- Lesson header with course, level, lesson number, objectives and estimated time.
- Main lesson content slot.
- Prompt Makeover, exercise and takeaway placement.
- Completion control.
- Course-outline navigation.
- Published previous/next navigation.
- Related-resource area.

### Component boundaries

- `partials/learn/course-navigation.njk`: renders published lessons as links, planned lessons as labelled non-links, and the current lesson with `aria-current="page"`.
- `partials/learn/prompt-makeover.njk`: renders the approved five-part Prompt Makeover consistently.
- `partials/learn/exercise.njk`: renders the semantic activity and no-JavaScript model feedback.
- `partials/learn/lesson-progress.njk`: renders completion control, visible status and a native `progress` element.

The hub and course overview should continue using `base.njk` directly. They may reuse the course-navigation partial and hub classes without pretending to be lesson pages.

---

## 9. Minimal browser-based progress

Use a single versioned first-party key:

`spinnit.learn.progress.v1`

Proposed value:

```json
{
  "version": 1,
  "courses": {
    "ai-prompting": {
      "completedLessonIds": ["how-ai-responds"],
      "lastVisitedLessonId": "how-ai-responds"
    }
  }
}
```

Requirements:

- Store stable IDs, not mutable display titles.
- Store no prompt text, exercise answer, identity, email, timestamp or sensitive data.
- Do not add checkpoint state until a checkpoint exists.
- Validate parsed shape, version and known lesson IDs before use.
- Wrap both reads and writes in `try/catch` for blocked, unavailable or quota-limited storage.
- If storage fails, show a calm status message and leave all lesson content/navigation usable.
- Explain that progress belongs to this browser/device, can be cleared with browser data and does not sync.
- A completion button must expose state through text and `aria-pressed`; colour alone is insufficient.
- Progress should describe published/available lessons, for example “1 of 1 available lessons completed”, rather than implying that planned lessons are already completable.

No GA event is required to make local progress work. No account, cookie, database or cross-device state is introduced.

---

## 10. Sitemap, indexation and localisation handling

### Published pages

When the three Phase 1 pages are approved as complete:

- Each has a direct self-referencing slash-form canonical.
- Each has a direct accurate `dateModified`.
- Each has `publicationStatus: published`.
- Each omits `noindex`.
- `pageLocales.js` discovers it as an English HTML source and adds it to the sitemap automatically.
- The existing generated SEO check requires it to be present in the sitemap and have inbound links.

The hub, overview and lesson will link back and forth through breadcrumbs, course navigation and CTAs, satisfying the repository’s no-orphan rule without changing legacy pages. This is a closed learning cluster plus sitemap discovery until the later discovery/repositioning phase.

### Review or incomplete pages

During implementation review, any incomplete source page must carry direct front matter:

```yaml
publicationStatus: draft
noindex: true
```

The direct `noindex` is essential because current sitemap discovery reads raw source front matter. Source validation will fail a non-published learning page that does not set it.

### Planned lessons

Planned lessons exist only as data with `url: null`. Do not create placeholder lesson files, empty Level 1 routes, fake links or canonicals.

### Localisation

- Every Phase 1 learning source is English only and sets `noAlternates: true`.
- `scripts/translate.js` should skip the top-level `learn/` directory until the approved localisation phase.
- Source validation should fail if `src/ar/learn/` or `src/de/learn/` appears before that policy is deliberately changed.
- Do not add course pages to the localised sitemap allowlist or infer hreflang mirrors.

### Sitemap files and dates

- Do not modify `src/sitemap.njk`; it already renders the repository data correctly.
- Do not update the global `site.sitemapLastmod`; use direct page dates for new learning pages.
- Keep the current default learning priority/frequency of `0.6` / monthly in Phase 1. Sitemap priority is not a ranking mechanism and does not justify new special-case code.

---

## 11. Validation changes

Extend `scripts/check-content.js`; do not add a second test framework or package dependency.

For `src/learn/**/*.html`, validate:

- Physical files are `index.html` and their path matches the explicit permalink and canonical.
- Canonicals are same-site HTTPS URLs with the approved trailing slash.
- Required `title`, `description`, `dateModified`, `lang`, `publicationStatus` and `contentType` fields exist.
- `dateModified` is a valid `YYYY-MM-DD` date.
- `publicationStatus` is `published` or `draft`.
- Draft pages have direct `noindex: true`; published pages are indexable.
- Lesson pages have course, level and lesson IDs; numeric order; positive estimated minutes; and at least one learning objective.
- Course, level and lesson IDs and lesson order are unique.
- Page metadata agrees with `learningCourses.json`.
- Every published course-data URL has a matching source file and canonical.
- Planned data entries have `url: null` and cannot render as links.
- No English learning page points to a missing Level 1 or planned-lesson route.
- The versioned learning CSS and JavaScript assets exist.
- No `src/ar/learn/` or `src/de/learn/` source exists.

Keep `scripts/check-seo.js` unchanged. It already verifies generated titles, descriptions, one H1, same-site canonicals, unique titles/H1s, internal links and fragments, sitemap membership, noindex/sitemap conflicts and orphan pages.

For an authoritative Phase 1 validation, build before running the combined content check because its SEO half reads `_site/`:

```bash
npm run build
npm run check:content
git diff --check
git status --short
```

Also inspect the three generated pages directly and test the relevant routes in a local server.

---

## 12. Accessibility and mobile requirements

- One descriptive H1 per page and a logical heading order.
- Semantic landmarks and an `aria-label` on course navigation.
- Native links, buttons, form inputs, `fieldset` / `legend`, `details` / `summary` and `progress`.
- Current lesson announced with `aria-current="page"`.
- Completion state conveyed through text/state, not colour alone.
- A polite live region for save success/failure without moving focus.
- Existing visible focus styles preserved.
- Minimum 44px interactive targets on learning controls.
- Prompt examples wrap safely and do not cause horizontal scrolling.
- No fixed content heights; one-column lesson/course navigation on narrow screens.
- DOM and focus order remain logical when the visual layout collapses.
- Planned lessons are text with a visible status, not disabled anchors or fake buttons.
- Reduced-motion rules disable learning transitions and override smooth scrolling for users who request reduced motion.
- Keyboard-only testing at narrow and wide viewports.
- Screen-reader checks for breadcrumbs, objectives, exercise labels, progress state and previous/next navigation.
- Essential lesson content remains usable with JavaScript disabled and with storage blocked.

The new `learn-v1.css` should use existing tokens and class names scoped under learning containers. It must not change stable global tool styles.

---

## 13. Service-worker approach

Recommended Phase 1 posture:

- Do not promise offline course availability.
- Do not add course HTML to the service-worker precache.
- Do not broaden service-worker registration.
- Leave `src/sw.js` unchanged.
- Use versioned new asset URLs, `/assets/learn-v1.css` and `/assets/course-progress-v1.js`, so existing cache entries cannot shadow the initial release.
- Treat a content change to either versioned asset as requiring a new URL version; do not silently replace bytes at the same URL.
- Test a direct uncontrolled learning visit and a learning visit controlled by an already installed `spinnit-v3` worker.
- Test online refresh, offline fallback after a visited lesson, storage clearing and a service-worker update.

Navigation remains network-first, so online lesson HTML is refreshed and previously visited HTML may be available during a later network failure. This is incidental resilience, not a Phase 1 offline-course guarantee.

If explicit offline support is approved instead, `src/sw.js` becomes an additional Phase 1 modification: bump the cache name, precache only the three complete pages and their versioned assets, and test install failures and cache cleanup. Planned routes must never be precached.

---

## 14. Analytics, advertising and privacy

Recommended Phase 1 posture:

- Keep the existing GA4 pageview implementation.
- Add no custom course events in Phase 1.
- Add no second analytics library.
- Never send prompt text, exercise answers, local progress contents or other learner input through analytics.
- Add a narrowly scoped `noAds` condition around the AdSense loader in `base.njk`.
- Set `noAds: true` for the learning section so the prototype has a reduced-distraction treatment.
- Do not add ad units to learning pages.
- Update `src/privacy.html` and its `dateModified` to explain the small browser-local progress record, what it contains, that it is not synced to Spinnit, and how clearing browser data removes it.

If later course events are approved, use guarded calls to the existing `window.gtag` only, with a separate event-name/parameter review. Page path, course ID, level ID and lesson ID are sufficient; free text must never be an event parameter.

---

## 15. Exact proposed Phase 1 files

The following is the exact recommended change set if the recommendations in section 18 are approved.

### Add

- `src/learn/learn.11tydata.js` — shared learning asset flags/settings only; indexing-critical fields remain direct page front matter.
- `src/learn/index.html` — Learn hub.
- `src/learn/ai-prompting/index.html` — course overview.
- `src/learn/ai-prompting/level-1/how-ai-responds/index.html` — complete prototype lesson.
- `src/_data/learningCourses.json` — course outline, stable IDs and published/planned navigation state.
- `src/_includes/layouts/lesson.njk` — reusable lesson composition.
- `src/_includes/partials/learn/course-navigation.njk`.
- `src/_includes/partials/learn/prompt-makeover.njk`.
- `src/_includes/partials/learn/exercise.njk`.
- `src/_includes/partials/learn/lesson-progress.njk`.
- `src/assets/learn-v1.css`.
- `src/assets/course-progress-v1.js`.

### Modify

- `README.md` — document `src/learn/`, English-only course policy, local progress and authoritative build/check order.
- `src/_includes/layouts/base.njk` — add the approved `noAds` guard around the existing AdSense loader; unset pages remain unchanged.
- `src/privacy.html` — disclose browser-local progress and update the page modification date accurately.
- `scripts/check-content.js` — add course metadata, data reconciliation, route, status, asset and localisation safeguards.
- `scripts/translate.js` — exclude `learn/` until the localisation pilot is explicitly authorised.

### Do not modify in Phase 1

- `.eleventy.js` — HTML/Nunjucks and recursive `src/assets` passthrough already support the plan.
- `package.json` or `package-lock.json` — no new dependency or script is needed.
- `src/src.11tydata.js` — use explicit learning breadcrumbs instead of expanding global computation.
- `src/_data/pageLocales.js` — direct front matter and data-only planned lessons already provide safe inclusion/exclusion.
- `src/_data/site.json` — do not globally rewrite the tagline or sitemap date yet.
- `src/sitemap.njk`.
- `scripts/check-seo.js`.
- `src/_includes/partials/nav.njk`.
- `src/_includes/partials/footer.njk`.
- `src/index.html`.
- `src/assets/style.css`.
- `src/ai/assets/css/style.css`.
- `src/sw.js` under the recommended no-offline-promise approach.
- `src/manifest.json`.
- Existing AI, classroom, workplace, tool, blog or localised page content.
- `_site/` by hand.
- `Spin logo.png`.

If ads remain inherited, remove `base.njk` from the Phase 1 modification list. If explicit course precaching is approved, add `src/sw.js` to it. Those are the only approval-dependent file-list deltas.

---

## 16. Risks and mitigations

| Area | Risk | Mitigation |
| --- | --- | --- |
| Existing routes | A permalink refactor could change established `.html` URLs | Add only physical learning `index.html` files; do not change global permalink logic |
| Canonicals | Base does not create one automatically; source/permalink mismatches can fail SEO | Direct self-canonical on every page; validation compares physical path, permalink and canonical |
| Intermediate route | Breadcrumb/nav may link to absent `/level-1/` | Reserve it for Phase 2 and omit that crumb/link in Phase 1 |
| Sitemap | A draft status alone would not exclude a page | Require direct `noindex: true` for drafts; planned lessons have no files/URLs |
| Sitemap dates | Updating the global fallback would falsely redatestamp legacy pages | Direct accurate `dateModified` only on new/changed pages |
| Localisation | Broad translation can generate unapproved course mirrors | Translation opt-out plus content-check failure for localised learn directories |
| Hreflang | An absent locale map can lead base logic to assume locales | Physical HTML routes plus direct `noAlternates: true` |
| Service worker | Cache-first CSS/JS can become stale | Versioned learning asset URLs; no HTML precache; controlled/uncontrolled tests |
| Offline expectations | Direct Learn visits do not necessarily install the worker | Make no offline-course claim in Phase 1 |
| Analytics/privacy | Progress or learner text could leak into measurement | Local IDs only; no custom events/free text; privacy disclosure |
| Advertising | Global loader can distract from a short lesson | Approved `noAds` flag scoped to learning pages |
| Global layout | A base-layout condition could affect all pages | Default remains current behaviour; build and generated-site checks cover legacy pages |
| Styling | AI/global selectors could collide or regress tools | New scoped learn stylesheet using existing tokens; do not load AI stylesheet |
| Accessibility | JavaScript-only feedback or colour-only progress can exclude users | Static model answer, native controls, text state, reduced-motion and keyboard/screen-reader tests |
| Mobile nav/footer | Global discovery additions can overflow dense navigation | No primary nav/footer/homepage change in Phase 1 |
| SEO discovery | Closed cluster has no legacy-site entry point | Internal hub/overview/lesson links satisfy validation; broader discovery remains Phase 4 or needs separate approval |
| Runtime mismatch | Local Node 24 differs from pinned Node 20 | Run CI-equivalent validation on Node 20 before merge/deploy |

---

## 17. Implementation sequence and review gates

### Step 1 — Metadata, routes and draft guard

- Add course data and the three physical HTML routes.
- Start incomplete pages as `publicationStatus: draft` plus direct `noindex: true`.
- Add exact canonicals, permalinks, dates and breadcrumbs.
- Add validation and translation safeguards first.

**Review gate:** Generated paths, canonicals, noindex state, course IDs and planned non-links.

### Step 2 — Static learning experience

- Add the lesson layout and component partials.
- Complete the Lesson 1 teaching content and no-JavaScript exercise/model answer.
- Build the Learn hub and course overview around the approved outline.

**Review gate:** Teaching accuracy, tone, claims, Prompt Makeover, lesson length and useful static HTML.

### Step 3 — Presentation and local progress

- Add scoped, versioned learning CSS.
- Add minimal guarded local progress.
- Update the privacy disclosure.
- Apply the approved reduced-distraction ad flag.

**Review gate:** Keyboard, screen-reader, mobile, reduced-motion, storage-disabled and no-JavaScript behaviour.

### Step 4 — Delivery and regression validation

- Test direct and already-service-worker-controlled visits.
- Confirm there is no course precache under the recommended policy.
- Build and run all content/SEO checks.
- Inspect generated source for one H1, canonical, robots state, breadcrumbs and static lesson content.
- Confirm existing route/canonical counts change only by the approved three published pages.

**Review gate:** Decide whether the three complete pages move from draft/noindex to published/indexable.

### Step 5 — Final indexation state

- If publication is approved, set all three complete pages to `published` and remove `noindex`.
- Confirm exactly those three URLs enter the sitemap.
- Run the full validation sequence again on Node 20.
- Do not deploy until separately authorised.

---

## 18. Decisions requiring approval before Phase 1

1. **URLs and route depth** — Approve the three trailing-slash URLs in section 6 and reserve `/learn/ai-prompting/level-1/` for Phase 2.
   **Recommendation:** Approve.

2. **Prototype lesson** — Confirm Lesson 1, “How AI responds to instructions”, and slug `how-ai-responds`.
   **Recommendation:** Approve; it tests explanation, comparison, exercise, Prompt Makeover and progress without depending on later concepts.

3. **Public course label** — Use “AI Prompting: Beginner to Applied Workflows” rather than “Beginner to Pro” in the title/H1.
   **Recommendation:** Approve the defensible label; it avoids implying accreditation or professional status.

4. **Course data model** — Use central `learningCourses.json` for outline/navigation plus direct page front matter for route and SEO-critical data.
   **Recommendation:** Approve; it fits the raw-source scanners and avoids duplicate standalone navigation.

5. **Draft navigation** — Show all approved Level 1 titles as non-linked “Coming later” items, with only the prototype linked.
   **Recommendation:** Approve; do not create placeholder routes.

6. **Final indexation state** — Publish/index the hub, overview and complete prototype together, or retain draft/noindex until all of Level 1 exists.
   **Recommendation:** Build as draft/noindex, then publish all three together after the Phase 1 content review. A useful complete prototype does not need to wait for Phase 2.

7. **Discovery before Phase 4** — Keep Phase 1 course-local with no homepage, primary nav, footer or legacy-content link, or approve one English-only inbound discovery link.
   **Recommendation:** Keep it course-local in Phase 1 to preserve the approved phase boundary. Broader discovery belongs in Phase 4.

8. **Advertising treatment** — Inherit the global AdSense loader or add `noAds` and suppress it on learning pages.
   **Recommendation:** Suppress it for the prototype and add no ad units.

9. **Analytics events** — Use pageviews only or add course start/completion events now.
   **Recommendation:** Pageviews only in Phase 1. Review event names and parameters after the learning interaction is proven.

10. **Structured data** — Use conservative `WebPage` JSON-LD plus existing breadcrumb schema, or introduce `Course` / `LearningResource` now.
    **Recommendation:** Use `WebPage` and breadcrumbs in Phase 1; reassess course-specific schema when Level 1 is complete.

11. **Service-worker posture** — No explicit offline promise with versioned assets, or precache the complete Phase 1 course cluster.
    **Recommendation:** No offline promise or course HTML precache in Phase 1; leave `sw.js` unchanged.

12. **Localisation safeguard** — Exclude `learn/` from broad translation and fail validation if localised learn sources appear before Phase 7.
    **Recommendation:** Approve both safeguards.

---

## 19. Phase 1 acceptance criteria

Phase 1 is ready for review only when:

- The three approved source routes generate at the exact proposed public URLs.
- Each has one H1, unique title/description, direct self-canonical and accurate date.
- Existing routes and canonicals are unchanged.
- The Learn hub and overview are useful destinations, not thin placeholders.
- Lesson 1 produces a complete learning outcome and follows the approved practice loop.
- Prompt Makeover uses all five approved parts.
- Planned lessons are non-links and have no generated routes or sitemap entries.
- The lesson, exercise, feedback and navigation work without JavaScript.
- Progress uses only the approved local IDs and fails gracefully when storage is unavailable.
- No prompt or answer text is persisted or sent to analytics.
- Keyboard, mobile, focus, reduced-motion and screen-reader requirements pass.
- The approved ad treatment and privacy disclosure are accurate.
- Direct and service-worker-controlled visits do not receive stale learning assets.
- Sitemap inclusion exactly matches the approved publication state.
- No translated course sources, hreflang mirrors or localised sitemap entries are created.
- Existing tools and generated SEO validation remain green.
- `npm run build`, `npm run check:content`, `git diff --check` and `git status --short` are reported.
- Nothing is committed, pushed or deployed without separate authorisation.
