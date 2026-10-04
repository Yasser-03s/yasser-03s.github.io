# DUNK RR — Workout Rank PWA

Mobile-first Progressive Web App for tracking the DUNK RR workout routine with Valorant-style ranks from Iron 1 to Radiant.

## Rank images

You do **not** need to manually download or process the rank PNGs. The GitHub Actions deployment workflow downloads the 25 supplied Wiki images at build time and removes the background by using the corner pixel color with an edge-connected flood fill. It then verifies that all 25 local transparent PNGs exist before deploying.

The deployed app uses `assets/ranks/*.png`, so rank images are local to the PWA and are cached for offline use.

## GitHub Pages

For `https://yasser-03s.github.io/`:

- Repository: `Yasser-03s/yasser-03s.github.io`
- Put `index.html` directly in the repository root.
- Push to `main`.
- In **Settings → Pages**, choose **GitHub Actions** as the source.
- The workflow `.github/workflows/deploy-pages.yml` builds and deploys the site automatically.

The deployment workflow intentionally does not use npm, npm caching, or a lockfile. This avoids the common `Dependencies lock file is not found` failure from `actions/setup-node` npm caching.

## Local development

```bash
python3 -m http.server 4173
```

For local rank generation (requires Pillow):

```bash
python3 -m pip install Pillow
python3 scripts/fetch-ranks.py
```

Then open `http://localhost:4173/`.
