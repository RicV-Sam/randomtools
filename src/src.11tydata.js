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
  },
};
