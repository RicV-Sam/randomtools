module.exports = {
  noAds: true,
  footerVariant: "learning",
  socialImage: "https://spinnit.site/assets/images/spinnit-learn-ai-social.png",
  socialImageWidth: 1200,
  socialImageHeight: 630,
  socialImageAlt: "Spinnit — simple, practical AI learning for complete beginners.",
  extraHead: `
    <link rel="stylesheet" href="/assets/learn-v1.css">
    <script src="/assets/course-progress-v1.js" defer></script>
  `,
  eleventyComputed: {
    breadcrumbs: (data) => data.learningBreadcrumbs || null,
    schemaBreadcrumbs: (data) => data.learningBreadcrumbs || null,
  },
};
