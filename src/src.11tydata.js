// Directory data: applies to every file in src/ and subdirectories.
// Keeps .html files at their original paths instead of Eleventy's default
// /name/index.html slug routing — so URLs on spinnit.site don't change.
module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // Explicit opt-out for template-only pages.
      if (data.permalink === false) return false;
      // If a page explicitly set a permalink in front matter, respect it.
      if (data.permalink) return data.permalink;
      // Otherwise preserve the source path (/privacy.html stays /privacy.html).
      return `${data.page.filePathStem}.html`;
    },
    breadcrumbs: (data) => {
      if (data.noBreadcrumbs || data.hideNav || !data.page || !data.page.filePathStem) return null;

      const stem = data.page.filePathStem;
      if (stem.includes("/404") || stem.startsWith("/ai")) return null;

      const isGerman = stem.startsWith("/de/");
      const prefix = isGerman ? "/de" : "";
      const homeLabel = isGerman ? "Startseite" : "Home";
      const urlFromStem = (path) => path.endsWith("/index") ? path.replace(/\/index$/, "/") : `${path}.html`;
      const title = (data.h1 || data.ogTitle || data.title || "")
        .replace(/ \| Spinnit$/, "")
        .replace(/&amp;/g, "&");

      if (stem === "/tools/index" || stem === "/de/tools/index") {
        return [
          { label: homeLabel, url: `${prefix}/` || "/" },
          { label: "Tools", url: `${prefix}/tools/` },
        ];
      }

      if (stem.startsWith("/tools/") || stem.startsWith("/de/tools/")) {
        return [
          { label: homeLabel, url: `${prefix}/` || "/" },
          { label: "Tools", url: `${prefix}/tools/` },
          { label: title, url: urlFromStem(stem) },
        ];
      }

      if (stem === "/blog/index" || stem === "/de/blog/index") {
        return [
          { label: homeLabel, url: `${prefix}/` || "/" },
          { label: "Blog", url: `${prefix}/blog/` },
        ];
      }

      if (stem.startsWith("/blog/") || stem.startsWith("/de/blog/")) {
        return [
          { label: homeLabel, url: `${prefix}/` || "/" },
          { label: "Blog", url: `${prefix}/blog/` },
          { label: title, url: urlFromStem(stem) },
        ];
      }

      return null;
    },
  },
};
