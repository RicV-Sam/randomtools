# First-conversation pilot

Implementation review: 26 September 2026. Local pilot; not published by this task.

## Scope and design

The approved pilot is three practical mini-lessons plus an independent task. Nine screens cover orientation, three knowledge checks, three real-platform tasks, an independent challenge, and reflection. The existing prompting course and tools remain accessible.

The pilot lives alongside the existing beginner guides at `/ai-for-over-50s/first-ai-conversation/`. It is linked from `/learn/` and the first-use ChatGPT guide. Keeping this as a companion avoids changing the existing course's route and progress registry before learner testing. It uses `noindex: true` during the pilot, is omitted from the sitemap, and remains ad-free through the existing guide data.

Content is in `src/_data/firstConversation.json`, rendered into ordinary HTML by Eleventy. `first-conversation-v1.js` progressively enhances it into one visible step at a time. With JavaScript unavailable, all lessons, native answer explanations and checklists remain readable. There is no live AI tutor or AI API cost. The examples are clearly labelled illustrations, not screenshots or live generated answers.

Wrong choices receive specific feedback with unlimited retries. Reading or skipping a practical task never marks it complete. Learners tick actions they report completing in ChatGPT. Completed practical tasks are labelled “Practised”, not certified or independently verified. Learners can move to any part of the path and revisit lessons. Confidence responses generate next-step advice but are not stored.

Optional persistence uses only `spinnit.learn.first-conversation.v1`: `version`, `current` step identifier, and `completed` checkpoint identifiers. It stores no selected answers, free text or identity. Opt-out deletes this key; the original `spinnit.learn.progress.v1` record is unchanged. If storage fails the course stays usable and explains the limitation. Existing site analytics were not changed; no new analytics events or prompt collection were added.

A direct step link takes precedence on arrival, then updates as the learner moves through the lesson. Reloading that address therefore keeps the latest visible step rather than returning to the original deep link. Plain lesson addresses stay plain, so an opt-out followed by a fresh visit starts at the welcome screen.

Printable instructions, keyboard controls, mobile tab-switching guidance, clipboard fallback and help for sign-in, limits and a lost conversation support real-platform practice. The first unit focuses on text conversations; it does not assert broad platform competence.

## Heart narration

All nine steps have optional narration using the existing AI Video Studio's Kokoro `af_heart` voice. Each quiz also has a separate recording for each answer's feedback: 18 recordings in total. Main quiz narration reads the choices but not the feedback. Feedback audio appears only after checking an answer and never starts automatically. Written lesson content and narration transcripts remain available.

Native audio controls provide play, pause and seeking. Slower, normal and faster settings carry across steps for the current visit. Moving to another step stops and rewinds previous narration; playing a different recording pauses the first. Switching to the ChatGPT tab does not intentionally stop narration. Listening does not mark a practical task complete. An audio download failure shows a readable fallback and a retry control; retry loads the recording without starting playback. Native main-step audio also works without JavaScript. Printing omits audio controls and duplicate transcripts.

Recordings are static MP3 files served by this site and requested on demand. Generation used the existing studio's local model and Python runtime, with no paid voice API call or running studio server. The studio's `speak` function created new WAV assets without changing existing video projects. No learner text is sent to a voice service. Narration is labelled as AI-generated on the lesson page.

The account guide adds four Heart recordings, bringing the pilot to 22 clips. Both pages share `learning-audio-v1.js` for playback speed, one recording at a time and download recovery. `first-conversation-v1.js` handles lesson-specific stopping and feedback selection.

Maintain scripts in `src/_data/firstConversation.json` and `src/_data/accountGuideNarration.json`. The corresponding audio manifests record file hashes, transcript fingerprints, durations, reviewed step-content hashes and reviewed HTML template hashes. Course paths and voice settings are in `scripts/learning-narration-config.json`. Hashed filenames avoid reusing an old recording after a script changes. After reviewing a changed lesson and its narration together, explicitly name the reviewed step; review templates separately when they change:

```powershell
& 'C:/Users/ricca/Documents/Codex/AI-Video-Studio-Runtime/venv/Scripts/python.exe' scripts/generate-learning-narration.py --course first-conversation --studio '\\DS223\homes\Rvallaro1978\Work\YouTube\AI-Video-Studio' --review-step first-message
& 'C:/Users/ricca/Documents/Codex/AI-Video-Studio-Runtime/venv/Scripts/python.exe' scripts/generate-learning-narration.py --course first-conversation --review-templates
& 'C:/Users/ricca/Documents/Codex/AI-Video-Studio-Runtime/venv/Scripts/python.exe' scripts/generate-learning-narration.py --course first-conversation --verify
npm run check:learning
npm run build
```

Use `--course account-guide` for the setup guide and repeat `--review-step` for each reviewed section. `--only CLIP-ID` can limit recording generation. Generating one clip never approves unrelated changed lessons. A step cannot be approved until all its recordings match their transcripts and files. Template review flags record a deliberate editorial check; they cannot establish semantic agreement automatically.

The Python verification mode uses only the standard library and needs no studio. The Node validator runs before every production build and checks both courses for missing/corrupt recordings, stale transcripts, changed lesson content and changed templates. PR and deployment workflows also run seven validator regressions. Four local standard-library Python tests in `scripts/test_learning_narration.py` cover preservation of review markers and refusal to approve missing/stale clips; these Python tests are not wired into CI. Generation reuses valid clips. If visible content changes without changing its narration, review the narration before deciding whether to re-record.

## Accuracy corrections

Three existing prompting lessons received narrow corrections: remove claims that prompt structure guarantees a first-attempt result, remove claims that negative instructions prevent invented facts, describe format instructions as targets to check, and replace the allergy/nutritionist example with fictional book-group activities. Their existing URLs and navigation are preserved. This is not a full rewrite of the older course; its more technical examples still merit later adaptation.

## Sources checked

- [ChatGPT on the web](https://learn.chatgpt.com/docs/web) and [official quickstart](https://learn.chatgpt.com/docs/quickstart): platform entry and chat workflow. Learners use Chat if a Chat/Work selector appears. Interfaces and account access can vary.
- [Gemini instructions](https://support.google.com/gemini/answer/13275745?hl=en): optional next-platform resource.
- [Copilot getting started](https://support.microsoft.com/en-us/microsoft-copilot/getting-started-with-microsoft-copilot): optional next-platform resource.
- [Senior Planet AI resources](https://seniorplanet.org/ai): optional guide, videos and free classes. Event schedules must be checked individually; the course does not promise particular dates.
- [Duolingo teaching method](https://blog.duolingo.com/duolingo-teaching-method/): inspiration for short practice and feedback, not evidence that this pilot improves outcomes.
- [W3C older users guidance](https://www.w3.org/WAI/older-users/): accessibility context; age is not a proxy for ability or prior knowledge.

## Validation evidence

- Eleventy build succeeded: 309 files written.
- Content check passed: 310 source HTML files.
- Generated-site check passed: 308 HTML pages, 16,428 internal links, 161 sitemap URLs; 37 localized AI pages retain noindex.
- JavaScript syntax and Git whitespace checks passed.
- Browser flow checks: 21 assertions passed for answer feedback, completion boundaries, keyboard entry/focus, opt-in persistence, skip behaviour, summary counts, confidence feedback, minimal saved fields, old-course preservation, opt-out, and malformed-record recovery.
- Saved-place regression checks: nine assertions passed for deep-link precedence, updated step links, reload recovery, agreement between visible and stored steps, plain-address resume, opt-out and unknown links.
- Browser resilience/layout checks: 12 assertions passed, including all nine screens at 1280/768/390/320 CSS pixels, 200% text enlargement on the practice screen, reduced motion, all-step printing and return to one-screen view, blocked clipboard, denied storage, and JavaScript-disabled reading/answer access.
- Narration checks: all 22 transcript/file fingerprints and reviewed source/template hashes verified. All generated MP3s decoded successfully with FFmpeg and served successfully from the local preview as `audio/mpeg`. Seven Node validator tests and four Python review-marker tests passed.
- Browser audio checks: 23 assertions passed for on-demand loading, no autoplay, native mouse and keyboard play/pause, speed changes, stopping between steps, matching feedback, one recording at a time, task completion boundaries, simulated download failure/retry, JavaScript-disabled playback and print behaviour. The original 21 flow and 12 resilience checks were rerun successfully after narration was added.
- axe scanned welcome, first quiz, first practice and reflection screens with WCAG A/AA tags. No violations reported; contrast review was incomplete for the decorative, aria-hidden back-arrow glyph in the existing navigation. This is not a WCAG conformance claim.
- Screenshots inspected for the start, reflection and mobile practice layouts. Local screenshots, print output and executable Playwright CLI checks are under ignored `output/playwright/`.
- Narration layout was also inspected at narrow mobile width and with enlarged text. Playback was verified through browser state and decoded media; pronunciation and subjective voice quality were not reviewed by ear. Include that listening review in the parent pilot.

The tests validate the local website, not actual learner independence, every assistive technology, every platform account, or a production deployment. No real messages were sent in ChatGPT during browser QA. No Core Web Vitals field data or full performance benchmark was collected. The pilot adds scoped styles, small scripts and static audio, without a new website runtime dependency.

## Parent test and next release

Use [the parent test sheet](first-conversation-parent-test.md). Keep the pilot noindex during testing. After a publication request, recheck the final diff, build, deploy and verify the exact public route and assets before giving parents a public link. A successful test should inform the next unit and any navigation refinements; do not infer success from page completion or checkbox counts.

The welcome and first practical step link to an optional [free-account picture guide](chatgpt-account-guide-evidence.md). It contains three dated, unaltered sign-up screenshots, button close-ups, four narrated sections and conditional usage-limit guidance. The guide opens separately to preserve the lesson; its pictures enlarge inside the guide with fit/actual-size controls and keyboard focus recovery. Registration after the public entry screen and an exact free-message allowance remain unverified. The guide passed 31 browser assertions; see its evidence note for scope and checks.
