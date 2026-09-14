# Spinnit weekly SEO sprint — 14 September 2026

One accuracy improvement was prepared and validated locally. The user subsequently authorized commit, push and live publication on 14 September 2026. The existing GitHub Pages workflow performs the production build, SEO checks and configured search-submission steps. The preparation findings and pending-status entries below describe the initial sprint handoff; the publication outcome is recorded in the automation run history. Google opportunity thresholds were preserved; no metadata experiment was started.

## Fresh-data gate and source receipt

Started in Analytics Hub. The Spinnit repository was not inspected until the managed refresh completed and today's site-specific handoff files had been verified.

- Command: `.\.venv\Scripts\python.exe -m analytics_hub.cli weekly-sprint-pack --site random-tools` (no `--no-refresh`).
- Refresh: 7d, 28d and 90d each completed with 15 successes, zero skipped and zero failures. Sprint-pack generation: six successes, zero failures; process exit 0. No process termination or lock recovery was needed.
- Managed run: 07:01:54–07:10:56 UTC on 14 September. Status: `completed`; site: `random-tools`; completed windows: `[7, 28, 90]`.
- [Refresh status](C:/Users/ricca/Desktop/analytics-hub-starter/reports/refresh-status/2026-09-14/random-tools/latest.json).
- [Manifest](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/latest-manifest.json): both site entries verified; all 12 listed files exist and were generated today.

Files read directly from the two `random-tools` manifest entries:

| Evidence | Active sprint | Context |
| --- | --- | --- |
| Main report | [28d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-sprint-report-28d.md) | [90d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-sprint-report-90d.md) |
| Page briefs | [28d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-page-briefs-28d.md) | [90d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-page-briefs-90d.md) |
| Task checklist | [28d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-sprint-tasks-28d.md) | [90d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-sprint-tasks-90d.md) |
| Opportunities JSON | [28d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-opportunities-28d.json) | [90d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-opportunities-90d.json) |
| Opportunities CSV | [28d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-opportunities-28d.csv) | [90d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-opportunities-90d.csv) |
| Low-volume diagnostics | [28d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-low-volume-diagnostics-28d.md) | [90d](C:/Users/ricca/Desktop/analytics-hub-starter/reports/sprints/2026-09-14/random-tools-low-volume-diagnostics-90d.md) |

The manifest does not list separate page/query exports or country files. Page/query evidence was read in the reports and corroborated against the local DuckDB cache, opened read-only. No country-targeted changes are justified by this handoff.

### Collection windows versus available observations

Collection runs for `spinnit.site` confirmed today's successful GA4 and GSC collection for all six source/window combinations:

| Window | GSC requested | GA4 requested |
| --- | --- | --- |
| 7d | 6–12 September | 7–13 September |
| 28d | 16 August–12 September | 17 August–13 September |
| 90d | 15 June–12 September | 16 June–13 September |

Latest returned GSC daily observation is **11 September**, not 12 or 14 September. GA4 daily observations reach **13 September**. Missing dates are not assumed to be zero. The main report's headline period uses the GSC dates; do not assume that every source uses that exact period.

GSC property figures in the reports are 1 click / 6 impressions / 16.67% CTR for 28d and 2 / 38 / 5.26% for 90d. CTRs were independently recomputed. The 28d diagnostics expose 13 page impressions and no query rows; the 90d diagnostics expose 107 page impressions and 12 query impressions across six queries. These dimensions are separate, non-additive evidence. Every individual page is below 25 impressions; both opportunity JSON files are empty, and both briefs/checklists have zero tasks. CTR repair retains the 50-impression guardrail.

## Growth and maintenance decisions

**Growth — monitor.** The configured AI lane has 3 page impressions across two pages in 28d and 47 across 12 pages in 90d. The homepage has 2 / 19 page impressions respectively; the prompt builder has one 90d impression. The new follow-up-questions guide has three page impressions at average position 1.7 in both windows, but is marked `Unassigned`: `config/sites.json` includes `/learn/`, `/ai/` and the prompt builder, but omits `/ai-for-over-50s/`. This guide is included qualitatively in this sprint's growth assessment. Its tiny sample does not support a title/content experiment. The configured lane totals were not silently relabelled or used as complete AI-cluster totals.

**Maintenance — one accuracy correction.** The configured tools lane has 5 page impressions / 1 click in 28d, and 29 / 1 in 90d. The tools and classroom hubs each have seven 90d impressions; the student picker has four and one click. No Google CTR, striking-distance, cannibalisation or internal-link task passes the normal thresholds.

Fresh supplementary Bing Web records repeatedly match the existing 2d6 tool and query. API-date 21 August: page 57 impressions / 0 clicks / impression position 8; query `roll 2d6` 47 / 0 / 9. API-date 11 September: page 39 / 0 / 9; query 34 / 0 / 9. These are individual weekly-dated top-result records, not complete daily or calendar-period totals. They were not added together, mixed with Google, or used to modify Google's opportunity scores. The source page already targets this intent; a live/source review found a factual contradiction suitable for correction without a snippet test.

### Bing availability and limits

All four endpoints succeeded on 14 September, recorded around 08:04:58–08:04:59 in the collector's timestamp representation. Page/query API dates extend to 11 September, traffic to 12 September, crawl to 13 September. The reports separately show 33 clicks / 1,333 impressions (28d filter) and 73 / 2,208 (90d filter) for all-vertical traffic; these are not Web-only totals and are not combined with GA4/GSC. API position values of -1 remain unavailable; the quoted positions above are the returned average impression positions. The 12 September crawl record reports zero crawl errors, HTTP 4xx and HTTP 5xx, and 152 in-index pages; it does not establish URL-level Google indexing.

## Local change and monitoring record

| URL/query | Status and hypothesis | Baseline and post-change result | Next review condition |
| --- | --- | --- | --- |
| `/tools/roll-2d6.html`; `roll 2d6` | Local, pending review. Correct probability explanation and replace an unsupported popularity claim with a direct definition. Intended benefit is accuracy and clarity for the existing dice intent. | Bing weekly records above are pre-change evidence. GSC has no actionable row. No post-change result exists because this is unpublished. | Review the diff; if subsequently published, record the deployment date and monitor comparable engine-specific records. Reassess snippet experiments on 5 October only if evidence supports them. |
| `/`, `/ai-for-over-50s/`, everyday prompts and related guides | GitHub deployment `33948737309` for `9c7c2bb9fe30b62f78ab86eee09d18940b0ecd38` was rechecked via `gh run view`: success, completed 5 September at 06:03:08 UTC. Hypothesis: clearer beginner journeys improve discovery and task use. | Full planned baseline is 9 August–5 September; post period is 6 September–3 October. That post period is incomplete. A same-dimension, property-wide six-day comparison has 0 clicks / 0 impressions on 30 August–4 September versus 1 / 4 on 6–11 September. This cannot attribute an effect to the AI release. No comparable page-cohort task-completion baseline is available. | Retain the documented 5 October review after the full window and reporting lag. Do not repeat metadata edits based on this sample. |

Only two visible paragraphs changed in [roll-2d6.html](C:/Users/ricca/Desktop/randomtools/src/tools/roll-2d6.html). The opening defines 2d6 and lists the six outcomes summing to seven. The probability paragraph now correctly describes a triangular distribution and explicitly states the independent/fair-dice assumption. Exhaustively enumerating all 36 ordered pairs yields counts `1,2,3,4,5,6,5,4,3,2,1` for totals 2–12, independently validating the explanation. The unchanged FAQ already says the distribution is triangular. Title, description, canonical, H1, schema, URLs, links, scripts and styles are unchanged.

## Scoped diagnosis and validation

The 31 August broad diagnosis is less than 28 days old and was not repeated wholesale. Today's new AI-lane omission and fresh Bing record were investigated narrowly. Live homepage, AI hub, follow-up guide and 2d6 tool returned HTTP 200 with expected self-canonicals and no robots noindex or X-Robots-Tag. Robots allows crawling. The live sitemap contains 161 URLs and no Arabic/German AI URLs. These checks establish technical availability, not proof of Google indexing.

- `npm run build`: passed; Eleventy copied 21 and wrote 307 files.
- `npm run check:content`: passed; source check covered 308 HTML files; SEO check covered 306 HTML files, 16,376 internal links, 161 sitemap URLs and 37 localized AI pages held at noindex.
- `git diff --check`: passed, with only Git's LF-to-CRLF working-copy warning.
- Playwright: desktop/mobile screenshots visually reviewed at 1440 and 390 pixels. Automated width checks at 1440, 768, 390 and 320 pixels found no horizontal overflow; 200% CSS zoom at width 1280 also had no overflow. Mouse roll showed `5 + 5 = 10`; keyboard activation showed `2 + 5 = 7`. Canonical remained unchanged.
- One browser console error was an HTTP 403 from the existing third-party Google advertising request. This sprint changes only paragraph text; advertising code was not modified. No full accessibility conformance or Core Web Vitals claim is made.
- Screenshot evidence is local and ignored under `output/playwright/seo-2026-09-14/`.
- Initial repo state had only untracked `Spin logo.png`; it was untouched. No pending sprint source edits existed to duplicate.

## Smallest next actions

1. Review the two-paragraph local correction; publication remains separately authorized.
2. Add `/ai-for-over-50s/` to Analytics Hub's growth-lane mapping in a reporting follow-up. This sprint records the omission without changing Analytics Hub application code or scores.
3. Monitor the follow-up-questions guide, homepage, prompt builder, student picker and Bing 2d6 records. Retain the 5 October full-window review. No market expansion, localization promotion, sitemap changes or indexing submissions were made.
