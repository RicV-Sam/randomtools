# Translation workflow

Translations are generated locally and committed as static files. Never commit real API keys.

## Google Cloud Translation

1. Copy `.env.example` to `.env.local`.
2. Set `GOOGLE_TRANSLATE_API_KEY` in `.env.local`.
3. Run:

```powershell
node scripts\translate.js ar
```

The script prefers the official Google Cloud Translation API when the key is present, then falls back to the unofficial Google package and local Argos if needed.

Generated files under `src/<lang>/` can be reviewed, edited, tested, committed, and pushed. The `.env` and `.env.local` files are ignored by Git.

## Arabic polish with OpenAI

Use this only as a local review tool for improving existing `src/ar/` copy. It is not part of the production build.

1. Set `OPENAI_API_KEY` in `.env.local`.
2. Scan what the tool would process:

```powershell
npm run polish:ar:scan
```

3. Generate suggestions for a small slice first:

```powershell
npm run polish:ar -- --file index.html --limit 20
```

This writes `arabic-polish-suggestions.json` and does not change source files.

4. Apply only after reviewing the suggestions:

```powershell
npm run polish:ar -- --file index.html --limit 20 --apply
```

Review with `git diff`, then run `npm run check:content` and `npm run build` before committing. Do not rerun broad machine translation over pages that have native or editorial Arabic improvements.
