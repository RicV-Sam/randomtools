# Spinnit Education Repositioning and Course Implementation Brief

**Project:** Spinnit
**Live site:** https://spinnit.site
**Repository:** Eleventy static website
**Document status:** Strategic direction approved; implementation proposals require repository inspection and phased approval
**Prepared:** 12 July 2026
**Intended audience:** Ric, ChatGPT, Codex and future contributors

---

## 1. Purpose of this document

This document is the single source of truth for repositioning Spinnit as an education-led website focused primarily on practical AI learning.

It is both:

1. A strategic direction document explaining what Spinnit is becoming and why.
2. An implementation brief showing how the new direction can be introduced without damaging the established production website.

This document does **not** authorise immediate production changes. Codex must first inspect the actual repository, validate the assumptions in this brief and divide implementation into small reviewable phases.

The document deliberately distinguishes between:

- **Approved direction:** decisions Ric has agreed in principle.
- **Proposed implementation:** the recommended way to execute the direction, subject to repository inspection and approval.
- **Deferred work:** ideas that must not be included in the initial release.
- **Open decisions:** matters that require evidence or explicit approval before implementation.

---

## 2. Executive decision

### Approved direction

Spinnit will move from an unfocused collection of random tools and an AI directory towards an education-led proposition centred on helping everyday people use AI more effectively.

The working positioning is:

> **Spinnit — Learn AI by doing.**
>
> Free lessons, practical exercises and useful tools that help everyday people get better results from AI.

The first flagship learning product will be a structured AI prompting course that moves learners from beginner foundations to applied workflows.

Education becomes the primary future growth direction. Existing tools and content will be preserved and repositioned as supporting resources rather than removed or indiscriminately redirected.

Spinnit remains the site and brand name. It should be referred to simply as **Spinnit**, with the live domain **spinnit.site**. “AI Tool Radar” may remain a section label if useful, but it must not operate as a competing site identity.

### Strategic principle

Spinnit should not become a generic education website covering unrelated subjects. Its initial education focus is:

- Practical AI literacy
- Better AI prompting
- Learning through guided practice
- Choosing appropriate AI tools
- Applying AI to everyday, educational and workplace tasks

This focus is narrow enough to establish a recognisable proposition while making use of Spinnit’s existing AI, classroom, workplace and browser-tool assets.

---

## 3. Current production context

Spinnit is an established production website and must not be treated as a greenfield build.

### Current technical foundation

- Node.js
- Eleventy 3.x
- Nunjucks templates
- Static HTML, CSS and client-side JavaScript
- GitHub Pages
- GitHub Actions
- Service worker and web app manifest
- IndexNow and Bing Webmaster URL submission
- Google Translate-based localisation maintenance
- Optional local or build-time OpenAI-assisted Arabic polishing
- No application backend
- No production database

Eleventy reads from `src/` and writes generated output to `_site/`.

### Current production snapshot supplied on 12 July 2026

- Branch: `main`
- Latest supplied commit: `5ba65c9 feat: add random emoji generator`
- Generated pages/files: approximately 284
- Source HTML files checked: approximately 285
- Generated HTML files checked by SEO validation: approximately 283
- Internal links checked: approximately 14,476
- URLs included in the sitemap: approximately 138
- Localised AI pages intentionally skipped by SEO QA: approximately 37
- English/non-localised HTML pages: approximately 144
- Arabic HTML pages: approximately 95
- German HTML pages: approximately 46
- English pages under `src/tools/`: approximately 67
- English pages under `src/ai/`: approximately 41

These counts are a handoff snapshot, not permanent acceptance criteria. Codex must verify current counts against the checked-out repository before relying on them.

### Current automated protection

The project does not have a conventional unit-test or lint suite. Its main automated safeguards are:

- `npm run check:content`
- `npm run build`
- Generated-site SEO validation
- Internal-link validation
- Metadata, canonical and H1 checks
- Sitemap and noindex conflict checks

### Existing route policy

Existing `.html` routes are intentional and must be preserved. For example, `/privacy.html` must not be changed simply to create `/privacy/`.

The presence of new directory-style learning routes does not authorise the migration of existing routes.

---

## 4. Why the direction is changing

Spinnit began with AI tools, expanded into random generators and subsequently developed several separate audience and content areas. The result is technically healthy and contains many useful tools, but the overall proposition is difficult to explain in one sentence.

A generic random-tool site has limited differentiation. A large AI directory is also difficult to keep fresh and competes with many established directories and software-review sites.

An education-led model gives Spinnit:

- A clear reason for users to return
- A structured journey instead of isolated page visits
- A natural relationship between content and interactive tools
- Search opportunities around beginner help, problem-solving and practical application
- A credible role for the existing AI directory and comparison pages
- A route to future paid learning products without making monetisation the immediate priority
- A stronger, more memorable brand proposition

The opportunity is not merely to publish a “prompt engineering course”. Generic prompting advice is widely available. Spinnit must differentiate through active learning, realistic examples, prompt improvement exercises, clear explanations and practical browser-based tools.

---

## 5. Product proposition

### Approved product model

Spinnit will connect four user needs:

1. **Learn** — structured lessons and courses.
2. **Practise** — exercises, quizzes, challenges and prompt-improvement tools.
3. **Choose** — the existing AI directory, comparisons and tool picker.
4. **Use** — the existing browser-based utility, classroom and workplace tools.

The learning experience becomes the primary proposition. The AI directory and functional tools support the learning journey.

### Core user promise

Spinnit should help someone move from:

> “I use AI, but I do not always get useful results.”

to:

> “I understand how to give AI a clear task, provide the right context, judge the response and improve it safely.”

### What Spinnit should not promise

Spinnit must not promise that:

- One framework produces a perfect prompt every time.
- AI answers will always be correct.
- Prompting removes hallucinations.
- Completing the course makes someone an accredited AI professional.
- A particular AI tool is always the best option.
- A paid level guarantees employment, income or business performance.

---

## 6. Target audiences

### Primary audience

Everyday AI users who have tried ChatGPT, Gemini, Claude or another assistant but do not consistently get useful results.

Typical characteristics:

- Beginner or early-intermediate AI knowledge
- Wants practical help rather than technical theory
- Uses AI for work, study, planning, writing, research or everyday tasks
- May not know terminology such as context windows, structured output or model hallucination
- Values examples that can be adapted immediately

### Secondary audiences

- Small-business owners
- Marketers and content creators
- Teachers and education staff
- Students and independent learners
- Freelancers
- Workplace professionals
- People comparing AI platforms

### Audience constraint

The initial course should teach transferable prompting principles. It may use ChatGPT prominently in examples because users recognise it, but it must not imply that the principles work only with ChatGPT.

---

## 7. Future role of existing Spinnit sections

No existing section should be deleted solely because it is not central to the new proposition.

| Existing area | Future role | Investment priority |
| --- | --- | --- |
| AI Tool Radar | Reference library for choosing tools during and after lessons | Maintain and selectively improve |
| AI comparisons | Decision-support content linked from relevant lessons | Maintain freshness; expand only where justified |
| AI tool picker | Course companion answering “Which AI tool should I use?” | High supporting priority |
| Classroom tools | Practical resources for teachers and classroom AI examples | High supporting priority |
| Workplace tools | Practical work examples and workflow use cases | High supporting priority |
| General random generators | Maintained utility library accessible through All Tools | Maintenance priority |
| Senior-friendly games | Accessible resource library | Maintain; avoid medical claims |
| Football and event tools | Seasonal utility content | Maintain selectively |
| Password and security content | Supporting material for privacy and safe AI use | Maintain; do not expand broadly yet |
| German and Arabic content | Existing international coverage | Preserve; no course expansion before English validation |

### Content freeze principle

Until the education proposition is validated, Spinnit should pause large-scale production of:

- Generic random generators
- Additional AI profiles with no demonstrated search or learner need
- Thin keyword variations
- Broad security expansion
- Broad localisation of new course content
- Seasonal tools unrelated to demonstrated demand

Maintenance, accuracy corrections and fixes to existing functionality remain in scope.

---

## 8. Proposed information architecture

### Proposed primary journeys

- Learn AI
- Free AI Prompting Course
- Prompt Lab
- AI Tools
- Classroom Resources
- All Tools

The exact navigation labels and URLs must be confirmed after Codex inspects the existing templates, navigation density and route conventions.

### Proposed learning structure

```text
/learn/
/learn/ai-prompting/
/learn/ai-prompting/level-1/
/learn/ai-prompting/level-2/
/learn/ai-prompting/level-3/
```

Individual lessons should have stable, descriptive URLs beneath the course structure. Example concepts include:

```text
/learn/ai-prompting/level-1/how-ai-responds/
/learn/ai-prompting/level-1/anatomy-of-a-good-prompt/
/learn/ai-prompting/level-1/add-context-and-constraints/
/learn/ai-prompting/level-1/ask-for-the-right-output/
/learn/ai-prompting/level-1/check-ai-answers/
```

These are proposed routes, not approved final routes. Codex must check how Eleventy currently handles permalinks, directory indexes, canonical generation, breadcrumbs, locale mappings and sitemap inclusion before implementing them.

### Homepage direction

The homepage should eventually communicate the learning proposition before the legacy utility catalogue.

Proposed hierarchy:

1. Clear education-led hero
2. Primary CTA: Start the free AI prompting course
3. Secondary CTA: Try the Prompt Lab
4. Course-level overview
5. Explanation of the learn-by-doing method
6. Popular AI learning resources
7. Relevant classroom and workplace tools
8. AI tool-selection support
9. Access to the full tool library

The homepage must not be redesigned until the course hub, at least one complete level and the Prompt Lab MVP are credible destinations.

---

## 9. Flagship course: AI Prompting from Beginner to Applied Workflows

### Working course title

**AI Prompting: Beginner to Pro** may be used as a motivating public label, but the content and claims should prefer the more defensible progression:

- Prompting Basics
- Prompting in Practice
- Applied AI Workflows

“Pro” must not imply accreditation or guaranteed professional status.

### Course goals

By the end of the full learning path, a learner should be able to:

- Explain why vague instructions produce unpredictable results
- State a clear goal for an AI task
- Provide useful context and source material
- Set relevant constraints without overcomplicating the prompt
- Request an appropriate output format
- Use examples and success criteria where helpful
- Improve an answer through follow-up instructions
- Ask AI to identify missing information
- Separate drafting from verification
- Recognise sensitive information that should not be submitted
- Build reusable prompts and multi-step workflows
- Evaluate whether an AI response is actually useful

### Learning design principle

The course must teach through practice, not through long explanatory articles alone.

Each lesson should follow a consistent loop:

1. Explain one concept in plain language.
2. Show a realistic weak prompt.
3. Ask the learner what is missing.
4. Improve the prompt step by step.
5. Explain why each change matters.
6. Give the learner a practical exercise.
7. Provide immediate feedback or a clear model answer.
8. Finish with a reusable takeaway or template.
9. Record progress locally.

### Prompt Makeover component

Every lesson should use a repeatable “Prompt Makeover” presentation:

- **Original prompt**
- **What is missing**
- **Improved prompt**
- **Why it is better**
- **What still needs checking**

Examples must be identified accurately:

- Use “illustrative example” for constructed scenarios.
- Use “anonymised learner example” only when it came from a real submitted prompt and permission allows its use.
- Never invent a user story and describe it as genuine.

---

## 10. Course curriculum

### Level 1: Prompting Basics

**Access:** Free
**Account required:** No
**Proposed length:** Five core lessons plus one checkpoint
**Outcome:** The learner can write a clear, safe and structured prompt for an everyday task.

#### Lesson 1 — How AI responds to instructions

Cover:

- AI predicts responses from the information and instructions supplied.
- It does not automatically know the learner’s unstated goal.
- Fluent language does not guarantee factual accuracy.
- A useful result begins with a clear task.

Practical exercise:

- Compare an ambiguous request with a task that contains a clear outcome.

#### Lesson 2 — The anatomy of a useful prompt

Introduce the core prompt elements:

- Goal
- Context
- Input
- Constraints
- Output format
- Success criteria or example

Clarify that not every prompt needs every element. The framework is a checklist, not a rigid formula.

#### Lesson 3 — Add the right context and constraints

Cover:

- Audience
- Purpose
- Background information
- Facts that must be used
- Length, tone and exclusions
- The difference between useful constraints and unnecessary complexity

#### Lesson 4 — Ask for the output you need

Cover:

- Bullet lists
- Tables
- Step-by-step instructions
- Short drafts
- Structured fields
- Alternative versions
- Reading level and tone

#### Lesson 5 — Check, question and improve AI answers

Cover:

- Asking what information is missing
- Requesting uncertainty to be identified
- Verifying important facts through authoritative sources
- Identifying invented citations or overconfident answers
- Not sharing confidential, personal or commercially sensitive information unnecessarily

#### Level 1 checkpoint

The learner improves a weak everyday prompt and explains which elements were added.

The checkpoint should assess understanding, not just whether a particular phrase was used.

### Level 2: Prompting in Practice

**Access:** Free
**Initial account requirement:** No
**Proposed length:** Six to eight lessons plus a capstone
**Outcome:** The learner can improve an AI conversation and adapt prompting techniques to practical scenarios.

Proposed modules:

1. Improve an answer through follow-up prompts
2. Get AI to ask clarifying questions
3. Use examples without overloading the prompt
4. Summarise and extract information from supplied text
5. Research prompts and fact-checking
6. Email, planning and workplace tasks
7. Learning and study prompts
8. Image-generation prompts

#### Level 2 capstone

The learner chooses a realistic task, creates a first prompt, reviews the result, identifies weaknesses and produces an improved version.

The course should emphasise that effective prompting is often iterative. There is rarely one permanently perfect prompt.

### Level 3: Applied AI Workflows

**Access:** Proposed one-off paid product
**Initial release:** Preview and waitlist only
**Implementation:** Deferred until free-course validation
**Outcome:** The learner can design reusable, multi-stage AI workflows and assess their quality.

Proposed modules:

- Reusable prompt systems and template libraries
- Working with long documents and multiple sources
- Separating research, drafting, critique and revision
- Structured outputs and introductory JSON
- Breaking complex tasks into stages
- Testing and debugging unreliable prompts
- Creating task-specific quality rubrics
- Building repeatable workplace and small-business workflows
- Understanding when an API or automation may be appropriate

Potential paid components:

- Downloadable workbook
- Reusable prompt templates
- Role-specific tracks
- Guided capstone project
- Limited personalised prompt feedback
- Spinnit completion certificate clearly labelled as non-accredited
- Access to material updates under clearly defined terms

### Paid-value constraint

Level 3 must not be merely additional hidden reading. It needs practical assets, guided application and a demonstrably stronger learning experience.

If AI-generated feedback is included in a one-off purchase, usage must be capped or governed by a clear fair-use allowance. Do not promise unlimited lifetime AI processing.

---

## 11. Prompt Lab specification

### Purpose

Prompt Lab is the interactive companion to the course. It should teach learners how to improve prompts, not simply generate a mysterious quality score.

### MVP approach

The first version should use transparent browser-based logic and require no AI API.

The learner can:

- Paste or write a prompt
- Select a use case
- Review the prompt against a practical checklist
- See which useful elements may be missing
- Build an improved prompt step by step
- Copy the result
- Reset the exercise
- Follow links to lessons explaining each element

### Proposed use cases

- Everyday task
- Workplace task
- Email or written communication
- Research
- Study or learning
- Marketing or social content
- Image generation

The rubric may change by use case. For example, an image prompt may benefit from composition and visual-style guidance, while a research prompt needs source and verification requirements.

### Core checklist

- Clear goal
- Relevant context
- Supplied input or facts
- Audience
- Useful constraints
- Requested output format
- Success criteria or example
- Verification requirement where appropriate
- Privacy warning where sensitive information appears likely

### Feedback style

Preferred:

> Your prompt has a clear objective and output format. Consider adding the intended audience and the facts the response must use.

Avoid:

> Your prompt is 82% perfect.

An unexplained numerical score creates false precision and does not teach the learner what to do next.

### Privacy

The MVP should process prompt text in the browser and state that it is not being sent to Spinnit.

The interface must remind users not to paste passwords, financial details, health information, customer records, confidential business information or other sensitive material.

### Future AI feedback

A future version may use a protected server-side endpoint to provide personalised feedback. That is not part of the MVP.

Any future implementation must include:

- Server-side secret protection
- Rate limiting and abuse controls
- Cost limits
- Clear provider and data-use disclosure
- A privacy review
- Output guardrails
- A fallback when the AI service is unavailable
- No unsupported claim that AI feedback is objectively correct

---

## 12. Proposed Eleventy implementation architecture

This section is a proposal. Codex must inspect the repository before selecting exact filenames, data structures or permalink conventions.

### Content model

Prefer a reusable course data model rather than copying large standalone lesson files.

Potential structured fields:

```yaml
courseId: ai-prompting
level: 1
lessonNumber: 2
title: The anatomy of a useful prompt
description: Learn the practical elements that make an AI prompt easier to follow.
learningObjectives:
  - Identify the goal, context, input, constraints and output format in a prompt.
estimatedMinutes: 10
previousLesson: /learn/ai-prompting/level-1/how-ai-responds/
nextLesson: /learn/ai-prompting/level-1/add-context-and-constraints/
updated: 2026-07-12
status: draft
```

Codex should adapt this model to existing front matter and data conventions rather than introducing a parallel system unnecessarily.

### Reusable lesson layout

The course should use a shared lesson layout or component system supporting:

- Course breadcrumb
- Level and lesson number
- Learning objective
- Estimated completion time
- Lesson content
- Prompt Makeover blocks
- Exercise blocks
- Knowledge check
- Key takeaway
- Previous and next lesson navigation
- Progress control
- Related AI tools or guides
- Updated date where useful and accurate

### Client-side progress

Initial progress should use `localStorage` and require no sign-in.

Store only the minimum necessary state, such as:

- Course identifier
- Completed lesson identifiers
- Last visited lesson
- Checkpoint completion state

Do not store the full text of a learner’s prompts by default. If a save feature is introduced, it must be clearly explained and remain local in the MVP.

The course must still be usable if local storage is unavailable or cleared.

### JavaScript approach

- Keep the initial feature set lightweight.
- Prefer reusable modules for new course interactions.
- Do not refactor stable legacy tools merely to match the new course architecture.
- Avoid introducing a large frontend framework solely for the course.
- Ensure essential lesson content remains present in generated HTML without JavaScript.

### Service worker

Codex must review the current service worker before adding course assets. Avoid stale cached lessons or broken navigation after deployments.

---

## 13. SEO and discovery strategy

### Search role of the free course

Levels 1 and 2 should function as both a coherent learning journey and a set of useful, indexable answers to real search needs.

Potential intent areas include:

- How to write better AI prompts
- How to prompt ChatGPT effectively
- Good and bad AI prompt examples
- AI prompting for beginners
- How to add context to an AI prompt
- How to improve an AI answer
- How to ask AI for a particular format
- How to fact-check AI responses
- AI prompts for work, teachers and small businesses

These should be covered through genuinely distinct lessons and resources, not thin keyword variations.

### Page principles

- One clear learning and search purpose per lesson
- Descriptive title and H1
- Concise answer-first introduction
- Original examples and exercises
- Strong course navigation
- Relevant internal links
- Accurate update information
- No unsupported expertise, popularity or outcome claims
- No fake reviews, learner numbers or completion statistics

### Internal linking

The course should link naturally to:

- Relevant AI tool profiles
- AI comparison pages
- AI tool picker
- Classroom resources
- Workplace tools
- Privacy and security guidance
- Related course lessons

Existing high-value pages may link into the course when the link genuinely helps the visitor.

Do not mechanically add course links to all existing pages.

### Sitemap and indexation

- Only complete, useful course pages should enter the sitemap.
- Drafts, previews and incomplete exercises must remain excluded.
- Paid-content pages require a separate indexing decision.
- English course content should be validated before localisation.
- Do not create machine-translated course mirrors automatically.

### Structured data

Codex may assess appropriate visible-content-aligned schema such as `Course`, `LearningResource`, `BreadcrumbList` or `Article`.

Structured data must:

- Match visible page content
- Avoid fake ratings or reviews
- Avoid unsupported course-provider claims
- Avoid promising recognised certification
- Pass existing validation

Schema should support clarity, not drive the content model.

### Sitemap dates

The supplied handoff states that `src/_data/site.json` contains a global `sitemapLastmod` value of `2026-05-06`, despite later development.

Codex should review the implementation separately. Do not update every URL to the current date unless every URL was materially reviewed or changed. Prefer accurate page-level modification dates where the existing architecture can support them safely.

---

## 14. Editorial and teaching standards

### Voice

- Clear
- Friendly
- Practical
- Calm
- Beginner-safe
- Free from hype and unnecessary jargon

### Teaching principles

- Explain the reason behind a recommendation.
- Use examples before abstract terminology where possible.
- Introduce one main concept at a time.
- Keep lessons short enough to complete in one sitting.
- Use retrieval questions and practical application.
- Let learners compare alternatives.
- Treat prompting as iterative rather than magical.
- Explain when a shorter prompt is sufficient.
- Teach verification and judgement alongside prompt construction.

### Trust rules

- Never invent first-hand tool experience.
- Never fabricate learner results, testimonials, ratings or completion numbers.
- Treat AI tool features and prices as time-sensitive.
- Do not claim prompting prevents AI errors.
- Do not reproduce copyrighted course content or large collections of prompts from third parties.
- Do not encourage submission of personal or confidential data.
- Clearly label constructed examples.
- State when a certificate is non-accredited.

### Accessibility

- Use semantic headings and form labels.
- Ensure keyboard access to exercises.
- Provide visible focus states.
- Do not rely on colour alone for correct or incorrect feedback.
- Use plain-language error messages.
- Keep tap targets usable on mobile.
- Respect reduced-motion preferences.
- Ensure progress can be understood by screen readers.

---

## 15. Measurement plan

The purpose of measurement is to determine whether users learn, continue and return—not merely whether pages receive impressions.

### Initial product metrics

- Course landing-page visits
- Course starts
- Lesson progression
- Level 1 checkpoint completion
- Prompt Lab starts
- Prompt Lab completions
- Copy-improved-prompt actions
- Return visits to continue learning
- Level 2 starts and capstone completion
- Level 3 waitlist intent

### Search metrics

- Course and lesson impressions
- Non-brand search queries
- Click-through rate
- Landing pages earning impressions
- Internal paths from AI and tool pages into learning pages
- Indexation status

### Quality metrics

- Exercise completion problems
- Repeated incorrect answers that suggest unclear teaching
- Mobile interaction failures
- User feedback on confusing lessons
- Broken lesson sequencing
- Prompt Lab abandonment points

### Measurement constraint

Do not publish vanity counters such as learner totals unless they are accurate, maintained and meaningful.

The existing analytics implementation must be inspected before adding events. Do not introduce a second analytics system without a clear need.

---

## 16. Monetisation pathway

### Approved principle

Monetisation is a later stage. Free Levels 1 and 2 should first demonstrate usefulness, completion and demand.

### Proposed Level 3 model

- One-off payment
- Indicative launch range: £19–£29, subject to validation
- Clear description of exactly what the learner receives
- No subscription until recurring value is proven
- Preview and waitlist before development

### Static-site limitation

GitHub Pages can host public static course content, client-side exercises and local progress. It cannot securely protect paid lesson HTML or private API credentials on its own.

Hiding paid content with CSS or client-side JavaScript is not acceptable access control.

### Proposed future architecture

A later paid implementation may combine:

- Hosted one-off checkout
- Protected serverless webhook
- Authentication
- Stored course entitlement
- Protected delivery of Level 3 content
- Optional cross-device progress

The exact provider combination must be reviewed at the time of implementation. Existing experience with Firebase may make it a candidate, but that does not authorise reuse of another project’s database or credentials.

### Payment and account work is deferred

Do not implement payments, authentication or entitlement logic during the MVP course release.

---

## 17. API and AI-service pathway

### MVP decision

The initial course and Prompt Lab must not require a live AI API.

This keeps the first release:

- Compatible with GitHub Pages
- Free to operate
- Easier to explain from a privacy perspective
- Resilient when a provider is unavailable
- Focused on transparent teaching rather than opaque grading

### Existing API-key constraint

Do not place OpenAI, Google, Cloudflare, Hugging Face or any other private service credential in frontend JavaScript, committed files or generated public output.

The existing preference for local or build-time AI-assisted maintenance does not automatically authorise live end-user AI processing.

### Future option

A later protected server-side service may provide personalised prompt feedback. Before implementation, the project must approve:

- Provider
- Model
- Cost ceiling
- Rate limits
- Data-use terms
- Privacy language
- Abuse prevention
- Retention policy
- Failure behaviour
- Whether paid access includes a fixed feedback allowance

---

## 18. Phased implementation plan

Each phase must be a separate, reviewable work package. Codex must not treat approval of this brief as permission to implement all phases.

### Phase 0 — Repository validation and planning

**Goal:** Confirm that the proposed plan fits the actual production repository.

Tasks:

- Inspect the repository structure and active branch.
- Confirm current build and validation behaviour.
- Confirm route, layout, navigation, sitemap and locale conventions.
- Identify existing CSS and components suitable for learning pages.
- Review service-worker implications.
- Confirm analytics implementation.
- Review the stale global sitemap date.
- Identify any dirty or untracked files without modifying them.
- Convert this strategic brief into a scoped implementation checklist.

Deliverable:

- Repository-grounded implementation plan
- No production feature changes

### Phase 1 — Learning foundation and prototype

**Goal:** Prove the learning-page architecture.

Proposed scope:

- Create `/learn/` hub.
- Create AI prompting course overview.
- Create one fully developed Level 1 prototype lesson.
- Create reusable lesson layout/components.
- Implement minimal local progress behaviour.
- Add draft course navigation.
- Add validation coverage for required lesson fields.
- Keep unready lessons out of the sitemap.

Acceptance focus:

- Generated HTML remains useful without JavaScript.
- Lesson is accessible and mobile friendly.
- Route and canonical behaviour are correct.
- Existing pages and tools are unaffected.

### Phase 2 — Level 1 completion

**Goal:** Publish a complete free beginner level.

Proposed scope:

- Five complete lessons
- Level 1 checkpoint
- Progress overview
- Previous/next navigation
- Prompt Makeover components
- Related-resource linking
- Course metadata and appropriate schema assessment

### Phase 3 — Prompt Lab MVP

**Goal:** Add an interactive practice tool without an AI API.

Proposed scope:

- Use-case selection
- Prompt checklist
- Guided prompt builder
- Transparent feedback
- Copy/reset controls
- Local-only privacy message
- Links into Level 1 lessons
- Keyboard and mobile testing

### Phase 4 — Homepage and discovery repositioning

**Goal:** Make education the visible primary proposition after credible destinations exist.

Proposed scope:

- Update homepage hero and hierarchy.
- Add course and Prompt Lab discovery.
- Adjust primary navigation carefully.
- Preserve access to existing tool hubs.
- Add selective internal links from relevant AI, classroom and workplace pages.
- Update site-level description only after checking downstream metadata use.

### Phase 5 — Level 2 and validation period

**Goal:** Expand practical application and assess demand.

Proposed scope:

- Publish Level 2 modules progressively.
- Add capstone experience.
- Add Level 3 preview and waitlist.
- Monitor search, progression, Prompt Lab use and return visits.
- Conduct user feedback sessions.

### Phase 6 — Level 3 business decision

**Goal:** Decide whether a paid course is justified.

Required evidence:

- Learners start and progress through free levels.
- Learners use the Prompt Lab.
- There is credible Level 3 intent.
- Proposed paid material offers more than additional articles.
- Payment, authentication, privacy and support costs are understood.

Only after approval should Codex design or implement paid access.

### Phase 7 — Localisation pilot

**Goal:** Test one carefully reviewed course localisation.

This phase is deferred until the English course performs and a native-quality review process is available.

Do not automatically translate the entire course into German or Arabic.

---

## 19. Explicitly deferred work

The following work is outside the MVP and must not be added opportunistically:

- User accounts
- Cross-device progress
- Payments
- Paid-content protection
- AI-generated personalised grading
- Unlimited AI feedback
- Accredited certification claims
- Full Level 3 production
- Course subscriptions
- Community forums
- Leaderboards
- Public learner profiles
- Mobile application redevelopment
- Broad course localisation
- Major legacy-tool refactoring
- Mass removal or redirection of existing content
- A large new security hub
- Additional unrelated random-tool clusters
- A broad education catalogue beyond practical AI learning

---

## 20. Production and repository guardrails

These rules are binding for future Codex work unless Ric explicitly changes them.

### Files and generated output

- Make source changes in `src/` and appropriate configuration or script files.
- Do not manually edit `_site/`.
- Do not delete, modify, stage or commit the untracked `Spin logo.png` unless explicitly instructed.
- Preserve existing user changes and unrelated dirty-worktree content.

### URLs and SEO

- Preserve existing URLs and canonicals.
- Do not convert established `.html` routes without explicit approval and a redirect plan.
- Do not add incomplete pages to the sitemap.
- Do not create thin keyword variants.
- Keep important pages discoverable from appropriate hubs.
- Add only structured data that matches visible content.
- Do not add Review or AggregateRating schema without genuine supporting methodology and visible data.

### Claims and trust

- No fake ratings, reviews, testimonials, usage counts or learner outcomes.
- No unsupported medical or therapeutic claims.
- No unsupported security guarantees.
- No betting advice in football content.
- Treat AI pricing, plans and feature availability as time-sensitive.
- Use accurate disclosure for commercial relationships.

### Localisation

- Preserve existing locale controls.
- Do not assume a translation is ready to index.
- Keep unreviewed localised course pages out of the sitemap.
- Do not infer hreflang availability blindly.

### Verification commands

For production changes, run at minimum:

```bash
npm run check:content
npm run build
git diff --check
git status --short
```

Use the project’s existing scripts and Node version. If a command fails because of the environment rather than the change, report that distinction clearly.

### Git and deployment

- Do not push directly to `main` without the review process required by the repository guidance.
- Do not commit or deploy unless the specific task authorises it.
- Do not expose production secrets in logs, files or responses.

---

## 21. Initial implementation acceptance criteria

Before the education-led homepage repositioning is considered ready, the following should be true:

- A useful `/learn/` destination exists.
- The AI prompting course has a clear public overview.
- Level 1 is complete enough to deliver a real learning outcome.
- Prompt Lab provides useful practice without requiring an AI API.
- Course progression works on mobile and keyboard navigation.
- Essential lesson content is present in static HTML.
- Progress enhancement does not block users who disable storage or JavaScript.
- Existing core tools continue to function.
- Existing URLs and canonicals remain stable.
- Content and SEO validation pass.
- Sitemap inclusion matches publication readiness.
- No unreviewed course translations are indexed.
- Privacy explanations accurately reflect browser-only processing.
- The homepage still provides a clear route to existing tools.

---

## 22. Decisions approved now

The following decisions are treated as approved strategic direction:

1. Keep the name **Spinnit** and domain **spinnit.site**.
2. Move future strategic focus towards practical AI education.
3. Use “Learn AI by doing” as the working positioning.
4. Build an AI prompting learning path from beginner foundations to applied workflows.
5. Make Levels 1 and 2 free initially.
6. Treat Level 3 as a potential one-off paid product, not an immediate build.
7. Use realistic prompt improvement and practice as the main differentiator.
8. Build the initial Prompt Lab without an AI API.
9. Preserve the existing production site and its URLs.
10. Keep existing AI, classroom, workplace and utility content as supporting assets.
11. Validate the English learning product before translating it.
12. Require a phased, repository-grounded implementation rather than a single large rebuild.

---

## 23. Proposed decisions requiring implementation review

The following are recommended but must be confirmed after repository inspection:

- Exact learning URLs and permalink format
- Exact primary navigation labels
- Exact homepage composition
- Course front-matter and data schema
- Lesson layout filename and component boundaries
- Prompt Lab route and code organisation
- Analytics event implementation
- Course-related structured data
- Per-page sitemap modification-date strategy
- Whether course pages should use the global AdSense implementation or a reduced-distraction treatment
- Exact Level 3 price and included benefits
- Future authentication, payment and AI providers

---

## 24. Questions to answer through evidence

These should not block the Phase 0 repository review, but they should inform later decisions:

1. Which existing AI, classroom and workplace pages already earn impressions or visits?
2. Which pages currently feed visitors into the AI directory or tool picker?
3. How is analytics currently implemented, and can course progression be measured cleanly?
4. Does the current service worker cache HTML in a way that could make course updates stale?
5. Which existing layouts or styles can support lesson components without a redesign?
6. Should course pages carry the same advertising load as utility pages?
7. What learner feedback mechanism can be added without creating unnecessary account or privacy complexity?
8. What evidence would be sufficient to justify building Level 3?

---

## 25. First Codex task after approval of this brief

Codex should receive the following instruction:

> Inspect the current Spinnit repository and validate this brief against the actual Eleventy implementation. Do not make production feature changes yet. Confirm the current route, layout, navigation, sitemap, locale, service-worker, analytics and validation conventions. Then produce a phased repository-grounded implementation plan for Phase 1: the learning hub, course overview, one Level 1 prototype lesson and minimal local progress. Preserve all existing URLs and canonicals. Do not edit `_site/`. Do not touch the untracked `Spin logo.png`. Do not commit, push or deploy unless separately authorised.

The Phase 0 response should identify:

- Assumptions in this brief that match the repository
- Assumptions requiring correction
- Proposed files to add or modify for Phase 1
- Validation changes required
- Risks to existing routes, localisation, service-worker behaviour or SEO
- A small implementation sequence with review points
- Any decisions Ric must approve before code changes begin

---

## 26. Definition of success

Spinnit’s repositioning succeeds when a new visitor can understand the site quickly and complete a useful learning action.

The desired experience is:

> “Spinnit teaches me how to use AI better, lets me practise what I learned and helps me choose or use the right tool.”

The project should resist measuring success only by the number of pages published. Success should be demonstrated through usefulness, lesson progression, repeat use, search discovery, trust and evidence that learners want to continue.

---

## 27. Change control for this brief

This document should remain the strategic source of truth until the initial education release is validated.

When decisions change:

- Update the relevant section rather than creating competing direction documents.
- Record material decisions clearly.
- Keep approved, proposed and deferred work distinguishable.
- Do not silently convert proposals into approved scope.
- Keep implementation details aligned with the actual repository.

Future task lists, lesson drafts and technical specifications may live in separate files, but they should reference this brief rather than restating the entire strategy.
