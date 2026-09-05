# Spinnit: protect search traffic while AI grows

## Approved release and follow-up schedule — 5 September 2026

The user authorised commit, push and live deployment after reviewing the findings. Release scope: AI guide usability/accessibility, practical homepage messaging, the early tools link, the existing homepage SEO title and an ad-free homepage. The user confirmed no advertising monetisation is currently active and any platform launch is some way off; ad suppression therefore has no identified current revenue tradeoff. The service-worker rewrite is deferred and excluded from the commit. Established tool pages remain unchanged.

The core guide series entered Git in `3bd0d9b` on **31 August 2026 at 11:38 BST**, and its [production deployment](https://github.com/RicV-Sam/randomtools/actions/runs/33383338689) completed successfully at **11:39 BST**. This improvement release went live on **5 September 2026**. Earlier references to unpublished changes describe the pre-release review.

| Task | When | Completion rule |
| --- | --- | --- |
| Verify indexing/discovery | 5–7 September; recheck 12 September | Inspect the hub and ChatGPT, prompts, privacy and checking-answers guides in GSC/Bing. Confirm canonical, crawl status, sitemap and incoming links. Request indexing where appropriate; submission does not guarantee indexing. |
| Consent-aware task events and clean measurement | 7–9 September | Audit consent behaviour; measure guide start, prompt copy and course start without prompt text. Exclude localhost/internal testing and test filters before activation. Annotate the instrumentation date; measure task outcomes only from then. |
| Reconcile Bing and investigate penalty decline | 7–9 September | Export each equal Web period separately; reconcile repeated totals and >100% keyword CTR. Check query/device/country mix and seasonality without changing the penalty page's intent. |
| Controlled snippet tests | Review 5 October; test only if evidence supports it | Use the first complete release window, 6 September–3 October, versus 9 August–5 September. Note the recent repositioning. Change one dice, meeting-rotation or number-picker page at a time. If counts remain tiny, defer to 2 November. |
| Printable rotas and AI-context answers | Research 14–18 September; implement 21–25 September if gaps are confirmed | Check existing features first, extend the chore tool and context lesson, and annotate a separate release. Avoid duplicate pages. |

**Review dates:** 5 October for 6 September–3 October; 2 November for 4–31 October. These allow reporting lag after complete 28-day windows. Keep tools and AI guides separate. Task-event measurement gets its own full window from its actual activation date. These are evaluation dates, not promises of search growth. No reminders were created.

### Release receipt

Content commit: `9c7c2bb9fe30b62f78ab86eee09d18940b0ecd38`, pushed to `main`. [GitHub Pages deployment 33948737309](https://github.com/RicV-Sam/randomtools/actions/runs/33948737309) completed successfully on **5 September 2026 at 07:03 BST** (06:03 UTC).

Local and deployment build/content/SEO checks passed: 306 generated HTML pages, 16,376 internal links, 161 sitemap URLs and unchanged localized noindex safeguards. Post-deployment HTTP checks returned 200 for the homepage, all five priority guides, tools index, penalty shootout tool, both new assets and sitemap. Browser inspection confirmed the new homepage content, successful navigation to the prompts page, all 12 copy buttons and no prompt-page horizontal overflow at the inspected viewport. No tool page source was changed; `src/sw.js` remains unchanged. Homepage ad code is suppressed through `noAds: true`. This documentation receipt does not change the deployed website payload.

## Executive Summary

- Continue the AI learning direction: the user confirmed that this repositioning is recent. Historical tool demand is not evidence against it.
- Preserve the tool URLs, titles, headings and links that currently earn traffic. Make the tools easy to find from the homepage.
- Keep the guide usability improvements. Treat their search and return-visit benefits as hypotheses to measure.
- Nothing has been published. The homepage title has been restored locally and an early tools link added.

## Google is too small for confident ranking conclusions

Google Web recorded **1 click and 44 impressions** over 3 June–2 September. The homepage earned the click and 23 page impressions; /tools/ had 12 impressions, /classroom-random-tools/ 10, and the add-context lesson 9. Page impressions use different aggregation from property totals and should not be summed against 44.

The seven disclosed queries had no clicks: “learnit” (5 impressions), “additional context” (2), “- additional notes/context” (2), and four one-impression terms. The clicked query is not disclosed. The last-28-day comparison showed 1 versus 0 clicks but 5 versus 21 impressions. The homepage position changed from 31 to 27.3 on only 3 current impressions: insufficient evidence of a durable improvement.

No /ai-for-over-50s/ URLs appeared in the 31 reported page rows. For a recently launched section, this is an early baseline, not proof of failure.

## Bing traffic depends on the existing tools

The saved three-month Web page export contains 62 URLs, **62 clicks and 1,292 page impressions**. The dashboard's rounded 1.7K All impressions includes a different scope and is not used as the Web denominator. The penalty tool generated 30 of 62 exported clicks (48.4%). No /ai-for-over-50s/ page appeared in the export. Keep these tools intact while the new learning section develops.

## Some tools are gaining visibility; the largest winner needs watching

Bing's displayed 6 August–4 September versus 7 July–5 August comparison showed:

- Random number 1–1,000,000: impressions **19 → 51**, position **6.68 → 5.25**, clicks **0 → 1**.
- Meeting rotation: impressions **9 → 44**, position **5.11 → 4.36**, still **0 clicks**.
- Wheel of names: impressions **16 → 22**, position **8.50 → 6.64**, still **0 clicks**.
- Roll 4d6 drop lowest: impressions **6 → 98**, clicks **0 → 3**, but average position worsened **4.17 → 6.60**. Growth in exposure is not necessarily better ranking.
- Penalty shootout: clicks **20 → 10**, CTR **33.90% → 12.20%**, position **3.54 → 5.01**. Protect this page and investigate separately; this predates the unpublished sprint.

Treat these as provisional UI trends. Some comparison rows repeat the entire three-month total in both periods (for example roll 2d6: 111/111 impressions versus 111 in the full export). Exclude those rows from trend claims and reconcile period exports before setting numerical targets. A keyword row also reports 11 clicks on 10 impressions (110% CTR); do not use that anomaly as a benchmark.

## Existing low-CTR demand mostly needs tool-specific answers

The 539-row Bing keyword export includes “roll 2d6” (88 impressions, no clicks, position 8.31), “random number between 1 and 1000000” (13, no clicks, 5.38), “spinnit” (11, no clicks, 4.55), and “wheel of names for teachers” (9, no clicks, 8). “Penalty shootout simulator” already earns 2 clicks from 24 impressions.

The over-50s wording does not directly answer dice, number-picker or classroom intent. Do not insert it into those pages' titles. For the brand query, a clear beginner benefit may help, but there is no demonstrated CTR lift yet.

Unaddressed opportunities include printable household chore rotations (“daily household choir rotation pdf”: 12 impressions, position 54.33; “chore wheel generator printable”: 3, position 5), meeting-chair rotas, and explanations of adding context to AI prompts. Improve relevant existing pages before creating new ones. The PDF query is primarily a ranking/intent gap, not simply a snippet problem. One Bing AI-context query has a single impression; it cannot establish demand for an over-50s course.

## Organic engagement is improving despite weaker overall averages

GA4 reports **58 organic sessions versus 45 (+28.9%)**, with **27 engaged sessions versus 19** and engagement rate **46.55% versus 42.22%**. Average organic engagement time fell from 44s to 36s. These are mixed but encouraging small-sample signals.

Overall sessions rose from 103 to 267, but the current period includes 77 Cross-network sessions with only 3.9% engagement and 1s average engagement. Do not attribute the overall increase to SEO or the fall in overall engagement to readability alone.

Across all channels, homepage landing sessions rose 27 → 119 while average engagement fell 76s → 3s. The new AI hub had 14 landing sessions and displayed 0s engagement. These warrant a clearer first action and tracking checks; they do not prove that older visitors are confused. Traffic mix, consent and measurement can affect these values.

AI Assistant sessions rose 5 → 21 (10 engaged currently). This is a channel label, not proof of AI citations to the new guides. No age/device breakdown or task-completion funnel was verified. GA4 shows zero key events; that does not establish zero successful tasks. Return-visit and accessibility benefits remain unmeasured.

## Changes still recommended for publishing later

- Keep practical homepage examples, the beginner-guide CTA and the direct first-ChatGPT CTA. Keep the over-50s H1 as the strategic direction; its impact is unproven, so avoid repeated rewrites.
- Keep the earlier first exercise and contextual safety links on /ai-for-over-50s/.
- Keep categories, permanent anchors, copy/print controls and specific checking advice on /ai-for-over-50s/everyday-ai-prompts/.
- Keep scoped readability, keyboard and mobile-navigation improvements and honest editorial/correction information.

These changes help users act and navigate. They do not require rewriting the search-winning tool pages.

## Changes modified or separated from the content release

**Adjusted locally in src/index.html:** restored the current live title, “Simple, Practical AI for Complete Beginners | Spinnit”, and matching WebPage schema name. Added a tools link immediately below the hero CTAs and renamed “More tools” to “Free random tools”. This preserves the new AI direction while serving existing tool visitors. The title restoration is a precaution, not a finding that the proposed title would cause a loss.

**Clarification after review:** the user confirmed no active advertising monetisation. Include the homepage's existing ad-free setting to suppress dormant ad code. The service-worker change affects asset delivery across the site, so defer it to a separate release with tool regression checks. Neither benefit is claimed to be validated by audience data.

Keep new prompts metadata as a test, and avoid further changes to winning tool titles, H1s, URLs, canonicals or navigation paths during this sprint.

## Reversions and protected content

The newly proposed narrow homepage SEO title has been reverted locally. No guide utility or accessibility changes need reverting on the available evidence. No established tool page copy, title, heading, URL or schema has been changed in this sprint. Do not reverse the recent AI repositioning because historical demand belongs to the older tools.

## Record three metrics before deployment

1. **Organic search clicks by engine and landing page.** Freeze equal complete 28-day windows, separately for Google and Bing, with established tools and new AI guides as separate groups. Current broad history: Google 1 click; Bing Web page export 62 clicks, across slightly different three-month windows. Reconcile Bing comparison anomalies before using its trend baseline.
2. **CTR for fixed query–page groups**, retaining impressions and average position. Track brand, AI beginner/context and tool intent separately, with device/country held comparable. Avoid blending page CTR with keyword CTR or interpreting one-click changes as success.
3. **Organic engagement rate and its denominator.** Current GA4 baseline: 27 engaged / 58 organic sessions = 46.55%, versus 19 / 45 = 42.22%. Break down by landing page and device before release where volume permits. Add first-exercise, prompt-copy and course-start measurement for a future task-completion baseline; no reliable completion baseline currently exists.

## Next five opportunities

1. Verify indexing and discovery of the new AI hub and its core guides; record launch/deployment dates and assess after complete post-launch windows.
2. Establish consent-aware task events and exclude local/internal testing from the measurement baseline.
3. Reconcile Bing period reporting, then investigate the penalty tool's click decline without changing its successful intent.
4. Improve existing dice, meeting-rotation and number-picker snippets against their actual query groups, one measured change at a time.
5. Address printable household rotas in the existing chore tool and strengthen the existing lesson's answer to AI-context queries.

## Validation and source notes

The Bing CSVs were read from the user's Downloads folder. Google Search Console and GA4 figures were read from authenticated reports on 5 September 2026. Bing dates differ from Google's; no engine growth ratio is claimed. Bing comparison anomalies and small samples limit trend confidence. Recent repositioning was confirmed by the user; the exact launch date was not supplied. Age, device and task-completion claims remain unverified.

The report chart validator rejected CSV provenance with a requirement for SQL query text. No SQL provenance was invented. This Markdown report preserves the findings and source names instead; no hosted report was rendered or published.

Local homepage adjustments passed Eleventy build, content checks and SEO checks: 306 generated HTML pages, 16,376 internal links and 161 sitemap URLs checked. Original tool page files are unchanged. Raw exports remain in Downloads; this report is outside the published src directory.
