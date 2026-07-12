(function () {
  "use strict";

  var STORAGE_KEY = "spinnit.learn.progress.v1";
  var STORAGE_VERSION = 1;
  var ROOT_SELECTOR = "[data-learning-progress], [data-course-progress]";

  function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function isSafeId(value) {
    return typeof value === "string" && /^[a-z0-9][a-z0-9-]{0,79}$/.test(value);
  }

  function parseIdList(value) {
    if (typeof value !== "string") return [];

    return value
      .split(/[\s,]+/)
      .map(function (id) { return id.trim(); })
      .filter(Boolean);
  }

  function unique(values) {
    return values.filter(function (value, index) {
      return values.indexOf(value) === index;
    });
  }

  function emptyState() {
    return {
      version: STORAGE_VERSION,
      courses: {}
    };
  }

  function getRoots() {
    return Array.prototype.slice.call(document.querySelectorAll(ROOT_SELECTOR))
      .filter(function (root, index, roots) {
        return roots.indexOf(root) === index;
      });
  }

  function buildCourseRegistry(roots) {
    var registry = {};

    roots.forEach(function (root) {
      var courseId = root.getAttribute("data-course-id");
      if (!isSafeId(courseId)) return;

      var knownIds = parseIdList(root.getAttribute("data-available-lesson-ids")).filter(isSafeId);
      var currentLessonId = root.getAttribute("data-lesson-id");
      if (isSafeId(currentLessonId)) knownIds.push(currentLessonId);

      if (!registry[courseId]) registry[courseId] = [];
      registry[courseId] = unique(registry[courseId].concat(knownIds));
    });

    return registry;
  }

  function normaliseState(candidate, registry) {
    var clean = emptyState();

    if (!isRecord(candidate) || candidate.version !== STORAGE_VERSION || !isRecord(candidate.courses)) {
      return clean;
    }

    Object.keys(candidate.courses).forEach(function (courseId) {
      if (!isSafeId(courseId)) return;
      if (!Object.prototype.hasOwnProperty.call(registry, courseId)) return;

      var knownLessonIds = registry[courseId];
      var candidateCourse = candidate.courses[courseId];
      if (!isRecord(candidateCourse)) return;

      var completed = Array.isArray(candidateCourse.completedLessonIds)
        ? candidateCourse.completedLessonIds.filter(function (lessonId) {
          return isSafeId(lessonId) && knownLessonIds.indexOf(lessonId) !== -1;
        })
        : [];

      clean.courses[courseId] = {
        completedLessonIds: unique(completed)
      };
    });

    return clean;
  }

  function readState(registry) {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        return { state: emptyState(), storageAvailable: true, recovered: false };
      }

      try {
        var parsed = JSON.parse(raw);
        var state = normaliseState(parsed, registry);
        var recovered = JSON.stringify(parsed) !== JSON.stringify(state);
        return { state: state, storageAvailable: true, recovered: recovered };
      } catch (parseError) {
        return { state: emptyState(), storageAvailable: true, recovered: true };
      }
    } catch (storageError) {
      return { state: emptyState(), storageAvailable: false, recovered: false };
    }
  }

  function writeState(state, registry) {
    try {
      var safeState = normaliseState(state, registry);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
      return true;
    } catch (storageError) {
      return false;
    }
  }

  function getCourseState(state, courseId) {
    if (!isRecord(state.courses[courseId])) {
      state.courses[courseId] = { completedLessonIds: [] };
    }

    if (!Array.isArray(state.courses[courseId].completedLessonIds)) {
      state.courses[courseId].completedLessonIds = [];
    }

    return state.courses[courseId];
  }

  function statusForCourse(roots, courseId, message) {
    roots.forEach(function (root) {
      if (root.getAttribute("data-course-id") !== courseId) return;
      var status = root.querySelector("[data-progress-status]");
      if (status) status.textContent = message;
    });
  }

  function renderCourse(roots, registry, state, courseId) {
    var availableIds = registry[courseId] || [];
    var courseState = getCourseState(state, courseId);
    var completedIds = courseState.completedLessonIds.filter(function (lessonId) {
      return availableIds.indexOf(lessonId) !== -1;
    });
    var completedCount = completedIds.length;
    var availableCount = availableIds.length;
    var countText = completedCount + " of " + availableCount + " available " +
      (availableCount === 1 ? "lesson" : "lessons") + " completed";

    roots.forEach(function (root) {
      if (root.getAttribute("data-course-id") !== courseId) return;

      root.setAttribute("data-progress-enhanced", "true");

      var meter = root.querySelector("[data-progress-meter], [data-progress-bar]");
      if (meter) {
        meter.max = Math.max(availableCount, 1);
        meter.value = completedCount;
        meter.setAttribute("aria-valuetext", countText);
      }

      var count = root.querySelector("[data-progress-count], [data-progress-summary]");
      if (count) count.textContent = countText;

      Array.prototype.forEach.call(root.querySelectorAll("[data-progress-toggle]"), function (button) {
        var lessonId = button.getAttribute("data-lesson-id") || root.getAttribute("data-lesson-id");
        if (!lessonId || availableIds.indexOf(lessonId) === -1) return;

        var isComplete = completedIds.indexOf(lessonId) !== -1;
        button.hidden = false;
        button.setAttribute("aria-pressed", isComplete ? "true" : "false");
        button.classList.toggle("is-complete", isComplete);

        var label = button.querySelector("[data-progress-button-label]");
        var labelText = isComplete ? "Completed — mark as incomplete" : "Mark lesson as complete";
        if (label) {
          label.textContent = labelText;
        } else {
          button.textContent = labelText;
        }
      });
    });
  }

  function renderAll(roots, registry, state) {
    Object.keys(registry).forEach(function (courseId) {
      renderCourse(roots, registry, state, courseId);
    });
  }

  function initialise() {
    var roots = getRoots();
    if (roots.length === 0) return;

    var registry = buildCourseRegistry(roots);
    if (Object.keys(registry).length === 0) return;

    var loaded = readState(registry);
    var state = loaded.state;
    var storageAvailable = loaded.storageAvailable;

    renderAll(roots, registry, state);

    if (!storageAvailable) {
      Object.keys(registry).forEach(function (courseId) {
        statusForCourse(
          roots,
          courseId,
          "Saved progress is unavailable in this browser. Course content is still available; completion changes will last until you leave or reload this page."
        );
      });
    } else if (loaded.recovered) {
      Object.keys(registry).forEach(function (courseId) {
        statusForCourse(
          roots,
          courseId,
          "Some saved progress was not recognised and will be ignored."
        );
      });
    }

    roots.forEach(function (root) {
      Array.prototype.forEach.call(root.querySelectorAll("[data-progress-toggle]"), function (button) {
        var courseId = root.getAttribute("data-course-id");
        var lessonId = button.getAttribute("data-lesson-id") ||
          root.getAttribute("data-lesson-id");

        if (!courseId || !lessonId || !registry[courseId] || registry[courseId].indexOf(lessonId) === -1) {
          return;
        }

        button.addEventListener("click", function () {
          var courseState = getCourseState(state, courseId);
          var completed = courseState.completedLessonIds.indexOf(lessonId) !== -1;

          if (completed) {
            courseState.completedLessonIds = courseState.completedLessonIds.filter(function (id) {
              return id !== lessonId;
            });
          } else {
            courseState.completedLessonIds = unique(courseState.completedLessonIds.concat(lessonId));
          }

          renderCourse(roots, registry, state, courseId);

          if (storageAvailable && writeState(state, registry)) {
            statusForCourse(
              roots,
              courseId,
              completed
                ? "Lesson marked as incomplete. Progress saved in this browser."
                : "Lesson marked complete. Progress saved in this browser."
            );
          } else {
            storageAvailable = false;
            statusForCourse(
              roots,
              courseId,
              "Progress changed for this page, but it could not be saved in this browser. It will reset when you leave or reload."
            );
          }
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
}());
