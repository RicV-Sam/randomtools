module.exports = {
  noAds: true,
  extraHead: `
    <link rel="stylesheet" href="/assets/learn-v1.css">
    <script src="/assets/course-progress-v1.js" defer></script>
  `,
  eleventyComputed: {
    breadcrumbs: (data) => data.learningBreadcrumbs || null,
    schemaBreadcrumbs: (data) => data.learningBreadcrumbs || null,
  },
};
