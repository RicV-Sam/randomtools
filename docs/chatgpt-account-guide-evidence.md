# ChatGPT free-account picture guide

Prepared 26 September 2026. Published pilot; no account was created during preparation. Indexability was enabled at the user's request after the first release.

## What was observed

An isolated, signed-out browser visited `https://chatgpt.com/` on 26 September 2026. The desktop viewport was 1100 × 720 CSS pixels. The narrow viewport was 390 × 844 CSS pixels, using a desktop browser; this is not a test of the native phone app or a physical phone.

- Desktop: “Sign up for free” and “Log in” were both visible at the upper right.
- Selecting “Sign up for free” opened “Log in or sign up”. The observed choices were Google, Apple, phone and email.
- Narrow viewport: “Log in” appeared at the upper right. Selecting it opened the same combined sign-in/sign-up window.
- The initial message box was visible while signed out. Screenshots are not proof of completing registration or signed-in access.

Three screenshots were captured through Playwright and copied unchanged into `src/assets/images/chatgpt-account/`. The sign-up window was captured directly as an element close-up; its content was not reconstructed or edited. No email, phone number, password, verification code, personal conversation or account identity appears. The three PNGs total 86,500 bytes. Dated filenames and captions identify the observation date.

## Sources and limits of verification

- Live sign-up entry and choice screen: `https://chatgpt.com/`.
- [Official ChatGPT quickstart](https://learn.chatgpt.com/docs/quickstart): browser entry and Chat/Work choices, fetched 26 September 2026.
- [Use ChatGPT](https://learn.chatgpt.com/docs/use-chatgpt): conversational Chat purpose and feature-availability caveats, fetched 26 September 2026.

The fetched ChatGPT Learn pricing page described Work/Codex usage. Its message estimates were not applied to ordinary Chat. A fixed ordinary-Chat Free message allowance or reset window for an individual learner was not established by these sources. The guide therefore provides conditional steps for interpreting the learner's actual notice, with no numeric entitlement, reset promise or fabricated limit screenshot.

No real account registration was completed. No password, verification or payment screen beyond the observed entry window was captured. Later account steps are described conditionally and remain private to the learner. No limit was intentionally exhausted and no paid plan was selected.

## Integration

The reference route is `/ai-for-over-50s/chatgpt-free-account/`. It is indexable and included in the sitemap at the user's request. Welcome, the first real-platform task and sign-in troubleshooting link to it in a new tab with `noopener noreferrer`. This keeps the current lesson page open, including unsaved in-memory progress. The guide tells the learner to return to that original tab.

The guide includes four optional Heart recordings covering the official website, sign-in choices, returning to practice and usage-limit notices. Transcripts are stored in `src/_data/accountGuideNarration.json`; `accountGuideAudio.json` records clip integrity and reviewed content/template hashes. Playback shares the lesson's audio controls, speed selection and retry behaviour. No new forms or learner-data fields were added.

The two button details use CSS cropping of the original PNG files; the source images remain unchanged. With JavaScript, the three screenshot links open a native dialog in the same page, with fit/actual-size views, Close picture and Escape support, and focus returned to the originating link. Without JavaScript, each link opens the original PNG in the same tab and browser Back returns to the guide. Full written directions and native audio remain available. The phone comparison uses native `details` so it can be expanded without JavaScript.

## Validation

The checks below describe the initial noindex release. The subsequent metadata correction enables both new pages in the sitemap (163 URLs total); it does not change lesson or narration wording and does not establish search-engine indexing.

- Eleventy build succeeded, writing 309 files.
- Source/content checks passed: 310 source HTML files; 308 generated HTML files, 16,428 internal links and 161 sitemap URLs.
- Thirty-one browser checks passed: route availability, keyboard expansion, all screenshots and close-ups loaded, no horizontal overflow at 1280/768/390/320 pixels and 200% text, picture dialog opening/closing and focus recovery, actual-size scrolling, correct image selection, no extra picture tabs, on-demand native audio and speed/one-player behaviour, noindex, separate guide-tab opening with the original lesson retained, and no-JavaScript image-link/Back recovery.
- All four guide recordings decoded during generation and served locally as `audio/mpeg`. Shared lesson audio failure/retry and no-JavaScript native playback checks also passed. Listening quality and pronunciation have not been reviewed by ear.
- axe reported no WCAG A/AA-tagged violations. Contrast inspection was incomplete for the existing decorative `aria-hidden` back-arrow glyph and the desktop button-detail caption. This is not a conformance claim.
- Desktop and mobile screenshots were visually inspected. No physical-device or assistive-technology test was performed.
- All 21 existing lesson-flow, 23 audio and 12 resilience/layout assertions were rerun and passed after the shared audio changes; nine saved-place regression assertions also passed.

Recheck these screens before publication and after a sign-up interface change. The parent test should include account setup, recognising the correct entry button, returning to the original lesson tab, and explaining how to pause if a limit appears.
