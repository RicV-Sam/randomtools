# Spinnit: SEO and audience-value sprint

Audited 5 September 2026. The user reviewed the performance findings and authorised live publication on 5 September. See [performance validation and release schedule](spinnit-performance-validation-2026-09-05.md) for the final decision, deployment receipt and follow-up dates. The initial proposals below are historical: the new homepage SEO title was reverted, an early tools link was added, and the service-worker rewrite is excluded. The user confirmed there is no active advertising monetisation; the homepage ad-free setting is included to suppress dormant advertising code, not as a revenue tradeoff. Existing tool pages remain unchanged. The later GSC, GA4 and Bing review supersedes the initial audit's lack of performance data.

## What I found

**Deployment receipt:** content commit `9c7c2bb` went live on 5 September 2026 at 07:03 BST through [successful GitHub Pages run 33948737309](https://github.com/RicV-Sam/randomtools/actions/runs/33948737309). Live priority-page and asset checks passed. The final included scope and next-work dates are in the performance-validation report linked above. Service-worker testing below documents a deferred prototype, not this production release.

The positioning is credible and the beginner cluster already has substance. The biggest opportunities are helping visitors recognise the intended audience, complete a first task and reuse the guides. A large-scale rewrite or a new batch of pages would add risk without solving those needs.

Direct HTTP checks returned 200 for the homepage and all five requested guide URLs, with self-referencing canonicals and one H1 each. The sitemap and robots file returned 200; an invented URL correctly returned 404. Some search-tool extracts were older than the direct live HTML, so findings use the direct responses and browser inspection where they differ.

| Area | Evidence and assessment |
| --- | --- |
| Positioning and homepage | The original H1 could describe almost any AI education site. Adults 50+ appeared in the supporting paragraph, but the opening did not lead with the audience or a concrete outcome. |
| First-visit experience | A fresh mobile homepage visit displayed a large advertising-consent panel before the learning content. The beginner guides already use the site's ad-free setting; the homepage did not. |
| Navigation and architecture | The beginner hub, learning hub and course serve different purposes, but “Start here” and “Learn AI” require interpretation. The hub's seven-card practical-guide directory preceded the first exercise. Homepage task descriptions were not linked to the relevant worked guides. |
| Search intent | Existing content covers first ChatGPT use, prompts, privacy, verification, scams, assistant choice, phones, voice, email, follow-up questions, free versus paid and terminology. The opportunity is deeper task completion within that cluster, not more near-duplicate introductory pages. |
| Internal links | The local baseline passed checks for missing internal destinations, fragments and orphaned core pages. Contextual links could be more useful even though links were technically valid. Tool hubs and direct footer links are valuable existing discovery routes. |
| Content quality | The privacy and verification guides have practical checklists and a worked travel-document example. The prompt page's description promised guidance for each example, but individual prompts lacked tailored checking notes. There were no copy controls, category shortcuts or print treatment. |
| Trust / E-E-A-T | The live guides already show Spinnit Editorial, a review date and editorial-policy links. Provider sources are present. There is still limited visible evidence of named human expertise and testing with the audience. These credentials must be supplied truthfully rather than fabricated. |
| Readability and mobile | The dark palette and purple accents are coherent. Navigation text was 12px and breadcrumbs approximately 11.5px. Small labels and a wrapped sticky header increase effort on phones. Inline links sometimes depended only on colour. |
| Calls to action and return visits | The course is useful but a relatively large commitment for a first visit. A direct first-conversation route and reusable prompt list provide smaller next steps. Browser-local course progress already exists and should be reused. |
| Technical SEO | Existing checks passed for 306 generated HTML pages, 16,334 internal links and 161 sitemap URLs. The service worker used cache-first delivery for unchanged CSS/JS filenames, so returning visitors could receive old assets alongside updated HTML. |
| Metadata and structured data | The five guide titles are distinct and describe their intents. The homepage title was generic. WebPage and BreadcrumbList markup already exists for guides; the homepage has WebSite/Organization/WebPage markup. No evidence justified replacing this with speculative rich-result markup. |
| Duplication and thin content | Automated checks found no duplicate titles or H1s among canonical English core pages. This is not a semantic audit of every article. Thirty-seven localized AI pages are already held at noindex pending review. Guide/course overlap should be monitored against actual queries before consolidation. |
| AI-search visibility | Definitions, numbered methods, practical examples and source links already provide a useful foundation. Clearer page purposes, contextual links and example-specific checks improve extractable substance. Google says ordinary SEO applies to AI features; no special AI schema or text file is required. See [Google's guidance](https://developers.google.com/search/docs/appearance/ai-features). |

No Search Console performance export, analytics conversion analysis or field Core Web Vitals data was analysed. Priorities are based on observed obstacles and user value, not invented keyword volumes or promised traffic gains. The global stylesheet imports external fonts, including an Arabic font on English pages; font delivery deserves separate measurement. The analytics tag remains unconditional in the shared template; its consent configuration needs a dedicated review before drawing any compliance conclusion.

## The five highest-impact changes and expected impact

1. **Make the first visit clearly about everyday AI for over 50s.** Updated the homepage H1, title, description, opening examples and reassurance. Added a first-ChatGPT-conversation CTA and applied the existing ad-free learning setting. Expected benefit: clearer audience fit and less obstruction before the first useful action. Ad revenue from the homepage is intentionally traded for the learning experience; other ad-enabled pages are unchanged.
2. **Shorten the route from reading to doing.** Moved the hub's first exercise before its practical-guide directory, explained where to type the prompt and added contextual privacy and verification links. Homepage tasks now link to relevant guides or prompt categories. Expected benefit: more first-task completions and stronger, purposeful topical connections.
3. **Make the prompt library useful enough to revisit.** Added four category shortcuts, stable links for all 12 prompts, copy controls with an accessible failure fallback, individual checking notes, bookmarking instructions and print support. Updated the description to match actual features. Expected benefit: less effort to start, safer use of responses and a reason to return. All prompts and instructions remain available without JavaScript; no prompt data is collected or stored.
4. **Improve reading, touch and keyboard access.** Added scoped styles for the homepage and beginner guides: larger text and controls, 44px primary-navigation targets, underlined prose links, non-sticky wrapped navigation on smaller screens, reduced-motion support and paper-friendly printing. Added a direct correction link to the existing trust notice. Expected benefit: easier navigation and reading without changing the visual identity.
5. **Make updates reach returning visitors reliably.** Advanced the service-worker cache, made same-origin styles/scripts network-first with offline fallback, reused navigation preload, awaited cache writes and restricted cleanup to Spinnit caches. Added learning styles to offline precaching. Separated the editorial-review date from the content-modification date so an interface edit does not imply a new factual review. Expected benefit: fewer mismatched page/asset versions, working offline fallback and more accurate trust metadata. Online CSS/JS refresh can require a network check; fingerprinted assets are a possible later optimization.

## Exact files changed

| File | Purpose |
| --- | --- |
| `src/index.html` | Homepage messaging, metadata, first-conversation CTA, contextual task links and ad-free setting. |
| `src/ai-for-over-50s/index.html` | Earlier first exercise, destination guidance, contextual safety links, accessibility stylesheet and genuine modification date. |
| `src/ai-for-over-50s/everyday-ai-prompts/index.html` | Category and example anchors, 12 checking notes, print/bookmark guidance, optional script loading and matching metadata. |
| `src/assets/guide-prompts.js` | Copy, failure feedback and print behaviour; no storage or external requests. |
| `src/assets/learning-accessibility.css` | Scoped readability, navigation, link, motion and print improvements. |
| `src/ai-for-over-50s/ai-for-over-50s.11tydata.js` | Apply styles across the beginner series and preserve the actual prior review date. |
| `src/_includes/partials/editorial-trust.njk` | Correct date semantics and a visible route to report errors. Also affects existing learning pages using this partial. |
| `src/sw.js` | Fresh asset delivery and offline/cache safeguards. |
| `.gitignore` | Keep temporary browser audit files out of version control. |
| `docs/spinnit-seo-ux-audit-2026-09-05.md` | This report. |

The ChatGPT, privacy and answer-checking pages receive shared readability/trust improvements without unnecessary body-copy or URL changes. Generated `_site` files were rebuilt, not edited by hand.

## Validation and corrections

- Build and existing source/SEO checks passed before and after implementation. The final check covered 306 generated HTML pages, 16,375 internal links and the same 161 sitemap URLs. These checks cover titles, headings, internal destinations and fragments, canonicals, sitemap membership and localized noindex safeguards.
- All 651 JSON-LD blocks parsed across 306 generated HTML pages. Guide breadcrumb hierarchy checks passed. This is not a claim of Google rich-result eligibility.
- Revisited all six requested surfaces at 320, 768 and 1440px. No content/navigation overflow was detected; primary navigation targets measured 44px high.
- Checked 200% root text sizing on the homepage, hub, prompts and privacy guide, with no detected overflow. This is text-enlargement testing, not a complete assistive-technology compatibility assessment.
- Tested skip-link focus, the homepage-to-hub-to-exercise path, copying exactly the prompt text, clipboard-denied selection fallback, print activation and hidden print controls, reduced motion, and all 12 prompts with JavaScript disabled. No page errors occurred in the interaction checks.
- Automated axe checks across the six priority pages finished with no violations in the tested WCAG A/AA rule sets. A decorative back-arrow contrast check required manual review; it uses the same readable colour as its label. This does not establish full WCAG conformance.
- Browser testing confirmed that deliberately stale cached CSS is refreshed, the homepage still loads offline and an unvisited offline URL shows the offline page. Additional isolated checks covered missing assets, navigation preload, non-GET and cross-origin bypass, and cache cleanup.
- Fixed two issues found during verification: new buttons initially inherited a pale browser background, and some legacy/checklist links still lacked underlines. Reran the relevant checks successfully.
- Official Google, Anthropic, GOV.UK, FCA and NHS source links responded successfully. OpenAI links rejected raw automated fetches with 403, but the [Academy page](https://openai.com/academy/getting-started/), [Data Controls FAQ](https://help.openai.com/en/articles/7730893-data-controls-faq) and [Temporary Chat FAQ](https://help.openai.com/en/articles/8914046-temporary-chat-faq) were accessible through web retrieval. A fetch restriction was not treated as a broken page.
- Screenshots and test evidence are in local `output/playwright/`. Cross-browser Safari testing, a full screen-reader review, field speed measurement and post-deployment verification remain unperformed.

## What I deliberately did not change

- Kept every established URL, canonical, sitemap route, tool hub and original homepage footer link. Without query-level performance evidence, deleting or consolidating these would risk existing search traffic.
- Kept the five descriptive guide titles, current structured-data types, robots rules and localized noindex controls. Added no fabricated reviews, author biographies, testimonials or freshness dates.
- Preserved colours, fonts, illustrations and the tool interfaces. This sprint solves practical obstacles rather than redesigning the brand.
- Added no new indexable pages, newsletter signup, paid offer or account system. These require distinct user value and an operating plan.
- Did not push directly to main or publish. The repository explicitly requires review before that deployment path.

## Next 5 opportunities

1. **Establish the search and task-completion baseline.** Review Search Console queries/pages and returning-visitor behaviour; track beginner-guide starts, prompt copying and course completion without collecting prompt text. Identify existing winners before any consolidation.
2. **Test with actual adults 50+.** Observe five people opening ChatGPT, adapting a prompt and checking an answer on their own phones. Use failures to decide which screenshots, labels or instructions are truly needed.
3. **Add verifiable editorial evidence.** Obtain the real editor's approved name, relevant experience and documented testing method. Add genuine observations and dated corrections, keeping the current organisational byline until those facts exist.
4. **Run a measured technical follow-up.** Measure field/lab performance, font delivery and third-party requests; review analytics consent configuration and test Safari, screen readers and enlarged text across the wider learning course.
5. **Develop one complete household-letter walkthrough.** Start from a fictional letter, remove identifying details, ask for a plain-English explanation and compare the output with the original. Include an error the reader must catch. Extend an existing relevant guide where practical rather than creating another generic introduction.
