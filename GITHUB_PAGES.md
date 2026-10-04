# DUNK RR — GitHub Pages deployment

This is a static PWA. The GitHub Actions workflow downloads the 25 supplied Valorant rank PNGs during the build, removes the edge-connected corner-color background using Pillow, verifies all 25 assets exist, and then deploys the complete site.

## Repository layout

For `https://yasser-03s.github.io/`, the repository must be `yasser-03s.github.io` and `index.html` must be at the repository root.

## GitHub setup

1. Upload the **contents** of this project to the repository root. Do not put everything inside a `dunkrank/` subfolder.
2. Commit to `main`.
3. Go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **GitHub Actions**.
5. Push a new commit or run the **Deploy DUNK RR to GitHub Pages** workflow manually from the Actions tab.

The workflow does not use npm or a lockfile, so GitHub's npm cache/lockfile issue cannot occur.
