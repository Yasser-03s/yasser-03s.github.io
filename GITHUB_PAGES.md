# GitHub Pages deployment

This project contains all app code in the repository root. The 25 rank PNGs do not need to be manually edited.

## Automatic (recommended)

1. Push this repository to `yasser-03s.github.io` on the `main` branch.
2. In GitHub: Settings -> Pages -> Source -> GitHub Actions.
3. Push/commit any change. The included workflow `.github/workflows/deploy-pages.yml` downloads the exact Wiki rank PNGs, removes only the corner-connected background color, and deploys the finished PWA.
4. Open `https://yasser-03s.github.io/`.

## Local preparation

On a machine with Node.js 20+ and internet access:

```bash
npm install
npm run fetch-ranks
```

This creates `assets/ranks/iron1.png` ... `assets/ranks/radiant.png` with transparent backgrounds.
