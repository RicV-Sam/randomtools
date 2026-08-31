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
          primaryNavigation: "Primary navigation",
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
          primaryNavigation: "Hauptnavigation",
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
          primaryNavigation: "التنقل الرئيسي",
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
    aiCommercialNotice: (data) => {
      if (data.noAiCommercialNotice || !data.page || !data.page.filePathStem) return false;

      const stem = data.page.filePathStem;
      return stem.startsWith("/ai/") && !stem.includes("/404") && !stem.includes("/templates/");
    },
    breadcrumbs: (data) => {
      if (data.noBreadcrumbs || data.hideNav || !data.page || !data.page.filePathStem) return null;

      const stem = data.page.filePathStem;
      // AI Tool Radar pages have their own visible breadcrumb pattern inside
      // the AI layout content. Keep the global breadcrumb renderer off there;
      // schema-only breadcrumbs for English AI pages are handled below.
      const isAiToolRadar = stem === "/ai" || stem.startsWith("/ai/");
      const isAiBeginnerGuide = stem === "/ai-for-over-50s" || stem.startsWith("/ai-for-over-50s/");
      if (stem.includes("/404") || isAiToolRadar || isAiBeginnerGuide) return null;

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
    schemaBreadcrumbs: (data) => {
      if (data.noBreadcrumbs || data.hideNav || data.noindex || !data.page || !data.page.filePathStem) return null;

      const stem = data.page.filePathStem;
      const isAiToolRadar = stem === "/ai" || stem.startsWith("/ai/");
      const isAiBeginnerGuide = stem === "/ai-for-over-50s" || stem.startsWith("/ai-for-over-50s/");
      if ((!isAiToolRadar && !isAiBeginnerGuide) || stem.includes("/404")) return null;

      const urlFromStem = (path) => path.endsWith("/index") ? path.replace(/\/index$/, "/") : `${path}.html`;
      const title = (data.h1 || data.ogTitle || data.title || "")
        .replace(/ \| Spinnit$/, "")
        .replace(/ \| AI Tool Radar$/, "")
        .replace(/&amp;/g, "&");

      if (stem === "/ai-for-over-50s/index") {
        return [
          { label: "Home", url: "/" },
          { label: "AI for over 50s", url: "/ai-for-over-50s/" },
        ];
      }

      if (isAiBeginnerGuide) {
        return [
          { label: "Home", url: "/" },
          { label: "AI for over 50s", url: "/ai-for-over-50s/" },
          { label: title, url: urlFromStem(stem) },
        ];
      }

      if (stem === "/ai/index") {
        return [
          { label: "Home", url: "/" },
          { label: "AI Tool Radar", url: "/ai/" },
        ];
      }

      return [
        { label: "Home", url: "/" },
        { label: "AI Tool Radar", url: "/ai/" },
        { label: title, url: urlFromStem(stem) },
      ];
    },
  },
};
