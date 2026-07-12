module.exports = function (eleventyConfig) {
  // Passthrough copy for assets that don't need processing.
  // These files are copied as-is to _site/ preserving their paths.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/ai/assets": "ai/assets" });
  eleventyConfig.addPassthroughCopy({ "src/icons": "icons" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/manifest.json": "manifest.json" });
  eleventyConfig.addPassthroughCopy({ "src/sw.js": "sw.js" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  // .well-known for Digital Asset Links (Android TWA) and future needs.
  eleventyConfig.addPassthroughCopy({ "src/.well-known": ".well-known" });

  // Watch CSS so eleventy --serve rebuilds when styles change.
  eleventyConfig.addWatchTarget("src/assets/");

  // Preserve the original URL structure (/privacy.html stays /privacy.html)
  // via the directory data file src/src.11tydata.js.

  // Shortcode: absolute URL builder, used for canonicals and og:url.
  eleventyConfig.addShortcode("absUrl", function (path) {
    const site = "https://spinnit.site";
    if (!path) return site + "/";
    return site + (path.startsWith("/") ? path : "/" + path);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // Treat .html as Nunjucks so we can use partials + front matter.
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html", "11ty.js"],
  };
};
