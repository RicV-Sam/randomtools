// Directory data: applies to every file in src/ and subdirectories.
// Keeps .html files at their original paths instead of Eleventy's default
// /name/index.html slug routing — so URLs on spinnit.site don't change.
module.exports = {
  eleventyComputed: {
    locale: (data) => {
      const code = data.lang || "en";
      const labels = {
        en: {
          home: "Home",
          tools: "Tools",
          blog: "Blog",
          allTools: "all tools",
          footerTagline: "free forever",
          privacy: "Privacy",
          terms: "Terms",
          about: "About",
          contact: "Contact",
        },
        de: {
          home: "Startseite",
          tools: "Tools",
          blog: "Blog",
          allTools: "alle Tools",
          footerTagline: "für immer kostenlos",
          privacy: "Datenschutz",
          terms: "Nutzungsbedingungen",
          about: "Über uns",
          contact: "Kontakt",
        },
        ar: {
          home: "الرئيسية",
          tools: "الأدوات",
          blog: "المدونة",
          allTools: "كل الأدوات",
          footerTagline: "مجاني دائماً",
          privacy: "الخصوصية",
          terms: "الشروط",
          about: "من نحن",
          contact: "اتصل بنا",
        },
      };
      return {
        code,
        dir: data.dir || (code === "ar" ? "rtl" : "ltr"),
        prefix: code === "en" ? "" : `/${code}`,
        labels: labels[code] || labels.en,
      };
    },
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

      const langMatch = stem.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)\//);
      const lang = langMatch ? langMatch[1] : "en";
      const locale = data.locale || {};
      const labels = locale.labels || {};
      const prefix = lang === "en" ? "" : `/${lang}`;
      const homeLabel = labels.home || "Home";
      const toolsLabel = labels.tools || "Tools";
      const blogLabel = labels.blog || "Blog";
      const urlFromStem = (path) => path.endsWith("/index") ? path.replace(/\/index$/, "/") : `${path}.html`;
      const title = (data.h1 || data.ogTitle || data.title || "")
        .replace(/ \| Spinnit$/, "")
        .replace(/&amp;/g, "&");

      if (stem === "/tools/index" || stem === `${prefix}/tools/index`) {
        return [
          { label: homeLabel, url: `${prefix}/` || "/" },
          { label: toolsLabel, url: `${prefix}/tools/` },
        ];
      }

      if (stem.startsWith("/tools/") || stem.startsWith(`${prefix}/tools/`)) {
        return [
          { label: homeLabel, url: `${prefix}/` || "/" },
          { label: toolsLabel, url: `${prefix}/tools/` },
          { label: title, url: urlFromStem(stem) },
        ];
      }

      if (stem === "/blog/index" || stem === `${prefix}/blog/index`) {
        return [
          { label: homeLabel, url: `${prefix}/` || "/" },
          { label: blogLabel, url: `${prefix}/blog/` },
        ];
      }

      if (stem.startsWith("/blog/") || stem.startsWith(`${prefix}/blog/`)) {
        return [
          { label: homeLabel, url: `${prefix}/` || "/" },
          { label: blogLabel, url: `${prefix}/blog/` },
          { label: title, url: urlFromStem(stem) },
        ];
      }

      return null;
    },
  },
};
