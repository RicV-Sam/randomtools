# First-conversation video companion

Prepared and approved for website release on 26 September 2026. The previously published practice and account pages remain indexable. Deployment and live checks must be verified separately from the local checks recorded below.

## Content and learner flow

`/ai-for-over-50s/video-lessons/` groups five short landscape lessons with complete approved narration transcripts, a specific practice task and a link to the relevant existing exercise. The course and account guide link back to this companion. Watching never changes practice completion or saved progress. Existing audio and interactive exercises remain available.

The new route has a canonical, no noindex directive and an automatically generated sitemap entry. This describes the built draft, not search-engine indexing or a live release.

## Connected YouTube uploads

The user supplied all five uploaded URLs on 26 September 2026. Their public titles and YouTube oEmbed responses identify the matching lessons on **Spinnit How To AI IT** (`@howtoaiit`). All five IDs are now set in `src/_data/firstConversationVideos.json`.

| Lesson | Uploaded video | Player duration |
| --- | --- | --- |
| 1: Get ready | https://youtu.be/8L-PvMxrZNs | 3:42 |
| 2: First useful request | https://youtu.be/0U5NOX-jdNk | 3:40 |
| 3: Improve a reply | https://youtu.be/owdJ1a3jZpo | 3:48 |
| 4: Check an answer | https://youtu.be/rMMqRnzrDnI | 3:56 |
| 5: Complete conversation | https://youtu.be/u-u4mDFPAsY | 3:45 |

The embed script creates an iframe only after an explicit click, uses the documented `youtube-nocookie.com` domain and preserves an origin referrer. It does not auto-play. The normal YouTube link remains available without JavaScript. Closing a player removes the iframe; opening another closes the previous one. Thumbnails are served locally.

Verified in a fresh browser session with real YouTube requests, without mocked players: each of the five embeds loads paused and starts playback after selecting Play. Reported durations match the local exports within encoder padding. Only one iframe remains when another lesson opens; closing removes it and returns keyboard focus. The initial page makes no YouTube requests. Desktop and 390px mobile layouts have no horizontal overflow, and the transcript opens on mobile. This confirms playback starts; it is not a full listening review of all five uploads. Evidence is saved under ignored `output/playwright/spinnit-lessons/`.

All five practice links were opened in real browser tabs. The account guide loads for lesson 1; lessons 2–5 open the visible `first-message`, `improve-message`, `check-message` and `own-task` exercises respectively. The private finished-video page includes the uploaded YouTube links; its release status is updated after live verification.

No `VideoObject` publication dates have been inferred from the upload verification date. Do not commit the large MP4 exports to this website repository.

## Production and upload files

Studio batch: `\\DS223\homes\Rvallaro1978\Work\YouTube\AI-Video-Studio\data\codex-batches\spinnit-ai-lessons-20260926`.

Each lesson folder contains the finished MP4 after rendering, studio-generated captions and publishing copy, plus an edited YouTube title/description file. The batch records actual project IDs, scene approval, measured timings and output checks. Narration uses local Kokoro Heart at 0.9 speed. Captions are burned into the video; the optional SRT has approximate timing. Check its synchronization if uploading it as an additional selectable caption track.

Sources: [YouTube embedding guidance](https://support.google.com/youtube/answer/171780?hl=en), [player parameters](https://developers.google.com/youtube/player_parameters), [chapter guidance](https://support.google.com/youtube/answer/9884579?hl=en), checked 26 September 2026. Descriptions start chapters at 00:00 and use at least three ascending timestamps with segments longer than ten seconds; chapter availability also depends on the channel.

## Release sequence

The user authorized this website release on 26 September 2026. The YouTube uploads are connected and the local build and content/SEO checks pass. Validate the release checkout, deploy and verify the live page, players, links, canonical and sitemap. A local build or eligible page does not establish publication or Google indexing.
