# Spinnit

Spinnit is an Eleventy static site for free random generators, picker tools, short guides, and an AI tools directory.

## Structure

- `src/` - source pages, templates, data, assets, robots.txt, sitemap template, and CNAME.
- `src/tools/` - random generator and picker tool pages.
- `src/blog/` - English guide pages.
- `src/ai/` - AI tool directory, comparisons, category pages, and guides.
- `src/de/` and `src/ar/` - localized mirrors.
- `src/_includes/layouts/base.njk` - shared HTML shell, metadata, canonicals, hreflang, JSON-LD, nav/footer rendering.
- `src/_data/pageLocales.js` - locale availability and sitemap URL data.
- `_site/` - generated Eleventy output. Do not edit manually.
- `scripts/` - content checks and localization maintenance scripts.
- `.github/workflows/deploy.yml` - GitHub Pages build and deploy workflow.

## Commands

```bash
npm ci
npm run check:content
npm run build
npm start
```

Useful maintenance commands:

```bash
npm run clean
npm run polish:ar:scan
npm run submit:bing -- --dry-run
npm run submit:indexnow -- --dry-run
```

There is no `lint` script currently.

## SEO And Indexing Notes

- Page titles, descriptions, canonicals, Open Graph metadata, and page JSON-LD are mostly controlled by front matter.
- The sitemap is generated from pages with `canonical` front matter unless `noindex` is set.
- `robots.txt` allows crawling and points to `https://spinnit.site/sitemap.xml`.
- Bing URL submission is available through `npm run submit:bing`. Set `BING_WEBMASTER_API_KEY` locally or as a GitHub Actions secret. The script reads `_site/sitemap.xml` by default, checks Bing quota, and submits in batches of up to 500 URLs.
- IndexNow submission is available through `npm run submit:indexnow`. Set `INDEXNOW_API_KEY` locally or as a GitHub Actions secret. The deployment workflow writes the required public key file into `_site`, then submits the live sitemap URLs through IndexNow. Do not use the private Bing Webmaster API key for IndexNow.
- Keep important tools reachable from the homepage, tool index, footer, related-tool blocks, and relevant blog guides.
- Avoid fake ratings, fake reviews, exaggerated claims, and long SEO copy above the actual tool interface.

## Deployment

Deployment runs on pushes to `main` and manual workflow dispatch. The workflow installs dependencies, runs `npm run check:content`, builds Eleventy, uploads `_site`, and deploys with GitHub Pages.

Do not push directly to `main` without review.
