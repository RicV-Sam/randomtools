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
