# RandomTools — GitHub Pages Deployment Guide

## What's included
- `index.html` — Homepage with all 10 tools listed
- `assets/style.css` — Shared dark-mode stylesheet
- `tools/` — 10 individual tool pages:
  - `random-number.html`
  - `dice-roller.html`
  - `coin-flip.html`
  - `team-picker.html`
  - `yes-no-wheel.html`
  - `colour-generator.html`
  - `password-generator.html`
  - `lottery-picker.html`
  - `percentage-generator.html`
  - `list-shuffler.html`

---

## Deploy to GitHub Pages in 3 steps

### 1. Create a GitHub repo
- Go to github.com → New repository
- Name it `randomtools` (or anything you like)
- Make it **Public**
- Don't add a README yet

### 2. Upload files
- Click "uploading an existing file"
- Drag and drop the entire `randomtools` folder contents
- Commit the files

### 3. Enable GitHub Pages
- Go to repo Settings → Pages
- Source: **Deploy from a branch**
- Branch: `main` / `root`
- Save — your site will be live at:
  `https://yourusername.github.io/randomtools/`

---

## After deployment — find & replace

Search all files for `yourusername` and replace with your actual GitHub username.

---

## Adding AdSense

1. Sign up at google.com/adsense
2. Add your site and get verified (takes 1-2 weeks for new sites)
3. Once approved, replace the AdSense comment blocks in each file:

```html
<!-- Replace this comment with your actual ad unit: -->
<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-YOUR_ID_HERE"
  data-ad-slot="YOUR_SLOT_HERE"
  data-ad-format="auto"
  data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

Also add this in the `<head>` of every page:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID_HERE" crossorigin="anonymous"></script>
```

---

## SEO checklist after launch

- [ ] Submit sitemap to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Add your site to Google Search Console and verify ownership
- [ ] Share the site on Reddit (r/tools, r/webdev, r/gamers for dice roller)
- [ ] Submit to directory sites: alternativeto.net, producthunt.com, toolpage.org

## Sitemap (create sitemap.xml in root)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://yourusername.github.io/randomtools/</loc></url>
  <url><loc>https://yourusername.github.io/randomtools/tools/random-number.html</loc></url>
  <url><loc>https://yourusername.github.io/randomtools/tools/dice-roller.html</loc></url>
  <url><loc>https://yourusername.github.io/randomtools/tools/coin-flip.html</loc></url>
  <url><loc>https://yourusername.github.io/randomtools/tools/team-picker.html</loc></url>
  <url><loc>https://yourusername.github.io/randomtools/tools/yes-no-wheel.html</loc></url>
  <url><loc>https://yourusername.github.io/randomtools/tools/colour-generator.html</loc></url>
  <url><loc>https://yourusername.github.io/randomtools/tools/password-generator.html</loc></url>
  <url><loc>https://yourusername.github.io/randomtools/tools/lottery-picker.html</loc></url>
  <url><loc>https://yourusername.github.io/randomtools/tools/percentage-generator.html</loc></url>
  <url><loc>https://yourusername.github.io/randomtools/tools/list-shuffler.html</loc></url>
</urlset>
```

---

## Next 10 tools to add (Phase 2)

1. Random name generator (first names by country)
2. Random animal picker
3. Number to words converter
4. Random emoji generator
5. Random quote generator
6. Timestamp converter
7. Random choice picker (wheel of choices)
8. Binary/hex converter
9. Random letter generator
10. BMI calculator

---

*Built with pure HTML/CSS/JS — zero dependencies, zero server costs.*
