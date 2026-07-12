#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const SITE_URL = "https://spinnit.site";
const languages = JSON.parse(fs.readFileSync(path.join(SRC, "_data", "languages.json"), "utf8"));
const localeMap = Object.fromEntries(languages.available.map((l) => [l.code, l]));
const pageLocales = require(path.join(SRC, "_data", "pageLocales.js"));
const incompleteLocalePages = JSON.parse(fs.readFileSync(path.join(SRC, "_data", "incompleteLocalePages.json"), "utf8"));
const LEARNING_DATA_FILE = path.join(SRC, "_data", "learningCourses.json");
const LEARNING_ASSETS = [
  path.join(SRC, "assets", "learn-v1.css"),
  path.join(SRC, "assets", "course-progress-v1.js"),
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function urlFromRel(rel) {
  const withoutExt = rel.replace(/\.html$/, "");
  if (withoutExt === "index") return "/";
  if (withoutExt.endsWith("/index")) return `/${withoutExt.replace(/\/index$/, "/")}`;
  return `/${withoutExt}.html`;
}

function urlForFile(file) {
  return urlFromRel(path.relative(SRC, file).replace(/\\/g, "/"));
}

function fail(list, file, message) {
  list.push(`${path.relative(ROOT, file)}: ${message}`);
}

function checkJsonLd(errors, file, data) {
  if (typeof data.jsonLd === "string") {
    try {
      JSON.parse(data.jsonLd);
    } catch (e) {
      fail(errors, file, `invalid front-matter jsonLd (${e.message})`);
    }
  }

  if (typeof data.extraHead === "string") {
    const rx = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = rx.exec(data.extraHead))) {
      try {
        JSON.parse(m[1]);
      } catch (e) {
        fail(errors, file, `invalid extraHead JSON-LD (${e.message})`);
      }
    }
  }
}

function checkLocalizedUrls(errors, file, data) {
  const rel = path.relative(SRC, file).replace(/\\/g, "/");
  const match = rel.match(/^([a-z]{2}(?:-[A-Z]{2})?)\//);
  if (!match) return;

  const lang = match[1];
  const locale = localeMap[lang];
  if (!locale || lang === languages.default) return;
  const prefix = locale.prefix || `/${lang}`;

  if (data.lang !== lang) {
    fail(errors, file, `localized page must set lang: ${lang}`);
  }

  if (locale.dir === "rtl" && data.dir !== "rtl") {
    fail(errors, file, `RTL localized page must set dir: rtl`);
  }

  if (typeof data.canonical === "string" && data.canonical.startsWith(`${SITE_URL}/`) && !data.canonical.startsWith(`${SITE_URL}${prefix}/`)) {
    fail(errors, file, `canonical should point to localized ${prefix}/ URL (found "${data.canonical}")`);
  }

  if (typeof data.navBackHref === "string" && data.navBackHref.startsWith("/") && !data.navBackHref.startsWith(`${prefix}/`)) {
    fail(errors, file, `navBackHref must stay in ${prefix}/ namespace (found "${data.navBackHref}")`);
  }

  if (typeof data.extraHead === "string") {
    const refreshRx = /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^"']*url=(\/[^"';]+)[^"']*["']/gi;
    let refresh;
    while ((refresh = refreshRx.exec(data.extraHead))) {
      const url = refresh[1];
      if (!url.startsWith(`${prefix}/`)) {
        fail(errors, file, `refresh URL must stay in ${prefix}/ namespace (found "${url}")`);
      }
    }
  }

  if (typeof data.jsonLd === "string") {
    try {
      const obj = JSON.parse(data.jsonLd);
      const stack = [obj];
      while (stack.length) {
        const node = stack.pop();
        if (!node || typeof node !== "object") continue;
        for (const [k, v] of Object.entries(node)) {
          if (typeof v === "string") {
            if ((k.toLowerCase().includes("url") || k === "mainEntityOfPage") &&
              v.startsWith(`${SITE_URL}/`) &&
              v !== `${SITE_URL}/` &&
              !v.startsWith(`${SITE_URL}${prefix}/`)) {
              fail(errors, file, `${k} should point to localized ${prefix}/ URL (found "${v}")`);
            }
          } else if (Array.isArray(v)) {
            for (const item of v) stack.push(item);
          } else if (v && typeof v === "object") {
            stack.push(v);
          }
        }
      }
    } catch {
      // handled by JSON-LD validation already
    }
  }
}

function checkArabicEnglishLeftovers(errors, file, raw) {
  const rel = path.relative(SRC, file).replace(/\\/g, "/");
  if (!rel.startsWith("ar/")) return;

  const obvious = [
    "all tools",
    "free forever",
    "Copy result",
    "Copied!",
    "Generate Number",
    "Recent results",
    "How to Use",
    "Privacy Policy",
    "Terms of Service",
  ];

  for (const phrase of obvious) {
    if (raw.includes(phrase)) {
      fail(errors, file, `Arabic page contains untranslated UI phrase "${phrase}"`);
    }
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isValidIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function isLearningUrl(value) {
  return typeof value === "string" &&
    value.startsWith("/learn/") &&
    value.endsWith("/") &&
    !value.includes("?") &&
    !value.includes("#") &&
    !value.includes("//");
}

function learningLessonKey(courseId, levelId, lessonId) {
  return `${courseId}/${levelId}/${lessonId}`;
}

function checkLearningPage(errors, file, raw, data, state) {
  const rel = path.relative(SRC, file).replace(/\\/g, "/");
  const publicUrl = urlFromRel(rel);
  const expectedPermalink = `/${rel}`;
  const expectedCanonical = `${SITE_URL}${publicUrl}`;
  const pageRecord = { file, raw, data, publicUrl };

  if (state.pagesByUrl.has(publicUrl)) {
    fail(errors, file, `learning URL duplicates another source page (${publicUrl})`);
  } else {
    state.pagesByUrl.set(publicUrl, pageRecord);
  }
  state.pages.push(pageRecord);

  if (path.basename(file) !== "index.html") {
    fail(errors, file, "learning source pages must use a physical index.html path");
  }
  if (data.permalink !== expectedPermalink) {
    fail(errors, file, `permalink must match the physical source path (expected "${expectedPermalink}")`);
  }
  if (data.canonical !== expectedCanonical) {
    fail(errors, file, `canonical must be the same-site trailing-slash URL for the physical source path (expected "${expectedCanonical}")`);
  }

  for (const field of ["title", "description", "dateModified", "lang", "publicationStatus", "contentType"]) {
    if (!isNonEmptyString(data[field])) {
      fail(errors, file, `learning page must set a direct non-empty ${field} field`);
    }
  }
  if (!isValidIsoDate(data.dateModified)) {
    fail(errors, file, "dateModified must be a real YYYY-MM-DD date");
  }
  if (data.lang !== "en") {
    fail(errors, file, "English learning pages must set direct lang: en");
  }
  if (data.noAlternates !== true) {
    fail(errors, file, "English-only learning pages must set direct noAlternates: true");
  }
  if (!new Set(["draft", "published"]).has(data.publicationStatus)) {
    fail(errors, file, "publicationStatus must be draft or published");
  } else if (data.publicationStatus === "draft" && data.noindex !== true) {
    fail(errors, file, "draft learning pages must set direct noindex: true");
  } else if (data.publicationStatus === "published" && data.noindex) {
    fail(errors, file, "published learning pages must be indexable");
  }
  if (data.publicationStatus === "draft" && pageLocales.sitemapUrls.includes(expectedCanonical)) {
    fail(errors, file, "draft learning page must remain outside sitemap data");
  }
  if (data.publicationStatus === "published" && data.canonical === expectedCanonical &&
    !pageLocales.sitemapUrls.includes(expectedCanonical)) {
    fail(errors, file, "published learning page must be present in sitemap data");
  }
  if (!new Set(["hub", "course", "lesson"]).has(data.contentType)) {
    fail(errors, file, "contentType must be hub, course or lesson");
  }

  if (publicUrl === "/learn/" && data.contentType !== "hub") {
    fail(errors, file, "the /learn/ source must use contentType: hub");
  }

  if (data.contentType !== "lesson") return;

  for (const field of ["courseId", "levelId", "levelTitle", "lessonId"]) {
    if (!isNonEmptyString(data[field])) {
      fail(errors, file, `lesson page must set a direct non-empty ${field} field`);
    }
  }
  for (const field of ["levelNumber", "lessonNumber", "estimatedMinutes"]) {
    if (!isPositiveInteger(data[field])) {
      fail(errors, file, `lesson ${field} must be a positive integer`);
    }
  }
  if (!Array.isArray(data.learningObjectives) || data.learningObjectives.length === 0 ||
    data.learningObjectives.some((objective) => !isNonEmptyString(objective))) {
    fail(errors, file, "lesson learningObjectives must contain at least one non-empty objective");
  }

  if (isNonEmptyString(data.courseId) && isNonEmptyString(data.levelId) && isNonEmptyString(data.lessonId)) {
    const key = learningLessonKey(data.courseId, data.levelId, data.lessonId);
    if (state.lessonPagesByKey.has(key)) {
      fail(errors, file, `lesson identity duplicates another source page (${key})`);
    } else {
      state.lessonPagesByKey.set(key, pageRecord);
    }
  }

  if (isNonEmptyString(data.courseId) && isNonEmptyString(data.levelId) && isPositiveInteger(data.lessonNumber)) {
    const orderKey = `${data.courseId}/${data.levelId}/${data.lessonNumber}`;
    if (state.lessonOrderKeys.has(orderKey)) {
      fail(errors, file, `lesson order duplicates another source page (${orderKey})`);
    } else {
      state.lessonOrderKeys.add(orderKey);
    }
  }
}

function readLearningCourses(errors) {
  if (!fs.existsSync(LEARNING_DATA_FILE)) {
    errors.push(`${path.relative(ROOT, LEARNING_DATA_FILE)}: central learning course data is missing`);
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(LEARNING_DATA_FILE, "utf8"));
    if (!data || Array.isArray(data) || typeof data !== "object" || Object.keys(data).length === 0) {
      fail(errors, LEARNING_DATA_FILE, "learning course data must be a non-empty object");
      return null;
    }
    return data;
  } catch (e) {
    fail(errors, LEARNING_DATA_FILE, `invalid JSON (${e.message})`);
    return null;
  }
}

function checkLearningDataUrl(errors, label, value) {
  if (!isLearningUrl(value)) {
    fail(errors, LEARNING_DATA_FILE, `${label} must be a trailing-slash /learn/ URL`);
    return false;
  }
  return true;
}

function checkLearningCourses(errors, courses, state) {
  if (!courses) return;

  const courseIds = new Set();
  const learningUrls = new Set();
  const dataLessonKeys = new Set();

  for (const [courseKey, course] of Object.entries(courses)) {
    if (!course || Array.isArray(course) || typeof course !== "object") {
      fail(errors, LEARNING_DATA_FILE, `course "${courseKey}" must be an object`);
      continue;
    }

    for (const field of ["id", "title", "shortTitle", "url"]) {
      if (!isNonEmptyString(course[field])) {
        fail(errors, LEARNING_DATA_FILE, `course "${courseKey}" must set a non-empty ${field}`);
      }
    }
    if (isNonEmptyString(course.id)) {
      if (courseIds.has(course.id)) {
        fail(errors, LEARNING_DATA_FILE, `course id must be unique (duplicate "${course.id}")`);
      }
      courseIds.add(course.id);
    }

    if (checkLearningDataUrl(errors, `course "${courseKey}" url`, course.url)) {
      if (learningUrls.has(course.url)) {
        fail(errors, LEARNING_DATA_FILE, `learning URL must be unique (duplicate "${course.url}")`);
      }
      learningUrls.add(course.url);
      const coursePage = state.pagesByUrl.get(course.url);
      if (!coursePage) {
        fail(errors, LEARNING_DATA_FILE, `course URL has no matching English source page (${course.url})`);
      } else {
        if (coursePage.data.contentType !== "course") {
          fail(errors, coursePage.file, `course-data URL must resolve to contentType: course (${course.url})`);
        }
        if (isNonEmptyString(course.title) &&
          !String(coursePage.data.title || "").toLowerCase().includes(course.title.toLowerCase())) {
          fail(errors, coursePage.file, `page title must agree with course-data title "${course.title}"`);
        }
      }
    }

    if (!Array.isArray(course.levels) || course.levels.length === 0) {
      fail(errors, LEARNING_DATA_FILE, `course "${courseKey}" must contain at least one level`);
      continue;
    }

    const levelIds = new Set();
    const levelNumbers = new Set();
    const lessonIds = new Set();
    const routableLessonIds = new Set();
    for (const level of course.levels) {
      if (!level || Array.isArray(level) || typeof level !== "object") {
        fail(errors, LEARNING_DATA_FILE, `course "${courseKey}" contains an invalid level`);
        continue;
      }
      for (const field of ["id", "title", "outcome"]) {
        if (!isNonEmptyString(level[field])) {
          fail(errors, LEARNING_DATA_FILE, `a level in course "${courseKey}" must set a non-empty ${field}`);
        }
      }
      if (!isPositiveInteger(level.number)) {
        fail(errors, LEARNING_DATA_FILE, `level "${level.id || "unknown"}" number must be a positive integer`);
      }
      if (isNonEmptyString(level.id)) {
        if (levelIds.has(level.id)) {
          fail(errors, LEARNING_DATA_FILE, `level id must be unique within course "${course.id}" (duplicate "${level.id}")`);
        }
        levelIds.add(level.id);
      }
      if (isPositiveInteger(level.number)) {
        if (levelNumbers.has(level.number)) {
          fail(errors, LEARNING_DATA_FILE, `level number must be unique within course "${course.id}" (duplicate ${level.number})`);
        }
        levelNumbers.add(level.number);
      }

      if (!Array.isArray(level.lessons) || level.lessons.length === 0) {
        fail(errors, LEARNING_DATA_FILE, `level "${level.id || "unknown"}" must contain at least one lesson`);
        continue;
      }

      const lessonNumbers = new Set();
      for (const lesson of level.lessons) {
        if (!lesson || Array.isArray(lesson) || typeof lesson !== "object") {
          fail(errors, LEARNING_DATA_FILE, `level "${level.id || "unknown"}" contains an invalid lesson`);
          continue;
        }
        for (const field of ["id", "title", "publicationStatus"]) {
          if (!isNonEmptyString(lesson[field])) {
            fail(errors, LEARNING_DATA_FILE, `a lesson in level "${level.id || "unknown"}" must set a non-empty ${field}`);
          }
        }
        if (!isPositiveInteger(lesson.number)) {
          fail(errors, LEARNING_DATA_FILE, `lesson "${lesson.id || "unknown"}" number must be a positive integer`);
        }
        if (!isPositiveInteger(lesson.estimatedMinutes)) {
          fail(errors, LEARNING_DATA_FILE, `lesson "${lesson.id || "unknown"}" estimatedMinutes must be a positive integer`);
        }
        if (isNonEmptyString(lesson.id)) {
          if (lessonIds.has(lesson.id)) {
            fail(errors, LEARNING_DATA_FILE, `lesson id must be unique within course "${course.id}" (duplicate "${lesson.id}")`);
          }
          lessonIds.add(lesson.id);
        }
        if (isPositiveInteger(lesson.number)) {
          if (lessonNumbers.has(lesson.number)) {
            fail(errors, LEARNING_DATA_FILE, `lesson number must be unique within level "${level.id}" (duplicate ${lesson.number})`);
          }
          lessonNumbers.add(lesson.number);
        }

        const key = isNonEmptyString(course.id) && isNonEmptyString(level.id) && isNonEmptyString(lesson.id)
          ? learningLessonKey(course.id, level.id, lesson.id)
          : null;
        if (key) dataLessonKeys.add(key);

        if (lesson.publicationStatus === "planned") {
          if (lesson.url !== null) {
            fail(errors, LEARNING_DATA_FILE, `planned lesson "${lesson.id}" must set url: null`);
          }
          if (key && state.lessonPagesByKey.has(key)) {
            fail(errors, state.lessonPagesByKey.get(key).file, `planned lesson "${lesson.id}" must not have a source page`);
          }
          continue;
        }

        if (!new Set(["draft", "published"]).has(lesson.publicationStatus)) {
          fail(errors, LEARNING_DATA_FILE, `lesson "${lesson.id || "unknown"}" publicationStatus must be draft, published or planned`);
          continue;
        }
        if (isNonEmptyString(lesson.id)) routableLessonIds.add(lesson.id);

        if (!checkLearningDataUrl(errors, `${lesson.publicationStatus} lesson "${lesson.id}" url`, lesson.url)) continue;
        if (learningUrls.has(lesson.url)) {
          fail(errors, LEARNING_DATA_FILE, `learning URL must be unique (duplicate "${lesson.url}")`);
        }
        learningUrls.add(lesson.url);

        const lessonPage = state.pagesByUrl.get(lesson.url);
        if (!lessonPage) {
          fail(errors, LEARNING_DATA_FILE, `${lesson.publicationStatus} lesson URL has no matching English source page (${lesson.url})`);
          continue;
        }
        if (lessonPage.data.contentType !== "lesson") {
          fail(errors, lessonPage.file, `routable lesson URL must resolve to contentType: lesson (${lesson.url})`);
        }

        const reconciliations = [
          ["publicationStatus", lesson.publicationStatus],
          ["courseId", course.id],
          ["levelId", level.id],
          ["levelNumber", level.number],
          ["levelTitle", level.title],
          ["lessonId", lesson.id],
          ["lessonNumber", lesson.number],
          ["estimatedMinutes", lesson.estimatedMinutes],
        ];
        for (const [field, expected] of reconciliations) {
          if (lessonPage.data[field] !== expected) {
            fail(errors, lessonPage.file, `${field} must agree with learningCourses.json (expected "${expected}")`);
          }
        }
        if (isNonEmptyString(lesson.title) &&
          !String(lessonPage.data.title || "").toLowerCase().includes(lesson.title.toLowerCase())) {
          fail(errors, lessonPage.file, `page title must agree with lesson-data title "${lesson.title}"`);
        }
      }
    }

    if (!Array.isArray(course.availableLessonIds) ||
      course.availableLessonIds.some((id) => !isNonEmptyString(id))) {
      fail(errors, LEARNING_DATA_FILE, `course "${course.id || courseKey}" availableLessonIds must be an array of non-empty lesson IDs`);
    } else {
      const configuredIds = new Set(course.availableLessonIds);
      if (configuredIds.size !== course.availableLessonIds.length) {
        fail(errors, LEARNING_DATA_FILE, `course "${course.id || courseKey}" availableLessonIds must be unique`);
      }
      for (const id of configuredIds) {
        if (!routableLessonIds.has(id)) {
          fail(errors, LEARNING_DATA_FILE, `course "${course.id || courseKey}" marks non-routable lesson "${id}" as available`);
        }
      }
      for (const id of routableLessonIds) {
        if (!configuredIds.has(id)) {
          fail(errors, LEARNING_DATA_FILE, `course "${course.id || courseKey}" omits routable lesson "${id}" from availableLessonIds`);
        }
      }
    }
  }

  for (const page of state.pages) {
    if (page.publicUrl !== "/learn/" && !learningUrls.has(page.publicUrl)) {
      fail(errors, page.file, `learning source route is not declared by learningCourses.json (${page.publicUrl})`);
    }
  }

  if (!courseIds.has("ai-prompting")) {
    fail(errors, LEARNING_DATA_FILE, "approved ai-prompting course data is missing");
  }

  for (const [key, page] of state.lessonPagesByKey) {
    if (!dataLessonKeys.has(key)) {
      fail(errors, page.file, `lesson metadata has no matching learningCourses.json entry (${key})`);
    }
  }
}

function checkLearningLinks(errors, state) {
  const linkRx = /\bhref\s*=\s*(["'])(\/learn\/[^"']*)\1/gi;
  for (const page of state.pages) {
    let match;
    while ((match = linkRx.exec(page.raw))) {
      const target = match[2].split(/[?#]/, 1)[0];
      if (!state.pagesByUrl.has(target)) {
        fail(errors, page.file, `learning link points to a missing source route (${target})`);
      }
    }
    linkRx.lastIndex = 0;
  }
}

function checkLearningImplementation(errors, state) {
  for (const asset of LEARNING_ASSETS) {
    if (!fs.existsSync(asset) || !fs.statSync(asset).isFile()) {
      fail(errors, asset, "required versioned learning asset is missing");
    }
  }

  for (const lang of ["ar", "de"]) {
    const localizedLearnDir = path.join(SRC, lang, "learn");
    if (fs.existsSync(localizedLearnDir)) {
      errors.push(`${path.relative(ROOT, localizedLearnDir)}: localized learning sources are not approved`);
    }
  }

  checkLearningLinks(errors, state);
  checkLearningCourses(errors, readLearningCourses(errors), state);
}

function main() {
  const files = walk(SRC);
  const errors = [];
  const fileUrls = new Set();
  const learningState = {
    pages: [],
    pagesByUrl: new Map(),
    lessonPagesByKey: new Map(),
    lessonOrderKeys: new Set(),
  };

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const { data } = matter(raw);
    const rel = path.relative(SRC, file).replace(/\\/g, "/");
    fileUrls.add(urlForFile(file));
    checkJsonLd(errors, file, data);
    checkLocalizedUrls(errors, file, data);
    checkArabicEnglishLeftovers(errors, file, raw);
    if (rel.startsWith("learn/")) {
      checkLearningPage(errors, file, raw, data, learningState);
    }
  }

  checkLearningImplementation(errors, learningState);

  if (!Array.isArray(pageLocales.sitemapUrls) || pageLocales.sitemapUrls.length === 0) {
    errors.push("sitemap data is empty");
  } else if (!pageLocales.sitemapUrls.some((url) => url.startsWith(`${SITE_URL}/ar/`))) {
    errors.push("sitemap data is missing Arabic URLs");
  }

  if (!Array.isArray(pageLocales.sitemapEntries) || pageLocales.sitemapEntries.length !== pageLocales.sitemapUrls.length) {
    errors.push("sitemap entries must match sitemap URL count");
  } else {
    for (const entry of pageLocales.sitemapEntries) {
      if (!entry || !pageLocales.sitemapUrls.includes(entry.loc)) {
        errors.push(`sitemap entry has unknown loc (${entry && entry.loc})`);
        continue;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod || "")) {
        errors.push(`sitemap entry has invalid lastmod for ${entry.loc}`);
      }
    }
  }

  for (const url of incompleteLocalePages) {
    if (!fileUrls.has(url)) {
      errors.push(`incomplete locale page does not exist (${url})`);
    }
    if (pageLocales.sitemapUrls.includes(`${SITE_URL}${url}`)) {
      errors.push(`incomplete locale page is present in sitemap data (${url})`);
    }
  }

  if (errors.length) {
    console.error(`check-content failed with ${errors.length} issue(s):`);
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  console.log(`check-content passed (${files.length} HTML files checked)`);
}

main();
