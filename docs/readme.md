# BuyButton.js Docs

This directory holds the Jekyll source for the public documentation site at
<https://shopify.github.io/buy-button-js/>.

## Local preview

Ruby and Jekyll are provisioned by `dev up` (see `dev.yml` and the root `Gemfile`).
After `dev up`, run:

```
pnpm run docs
```

The site is served at <http://localhost:4000/buy-button-js/>.
`dev open docs` assumes Jekyll's default port (4000); if you pass `--port` to override it, open the URL Jekyll prints instead.

## Deployment

GitHub Pages builds this directory automatically from `main` — the Pages source
is configured to `/docs` on the `main` branch. There is no `gh-pages` branch and
no deploy workflow; pushes to `main` trigger a Pages rebuild.
