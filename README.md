# StockTheEvent

Party quantity calculators. Given an event type, an item (beer, wine,
pizza, ice, and so on), and a guest count, the site tells you how much to
buy. Live at https://www.stocktheevent.com/.

See `CLAUDE.md` for the rules every change in this repo must follow, and for
the target design token system.

## Structure

```
scripts/
  generateData.ts       drink calculator page data
  generateFoodData.ts   food calculator page data
  checkSite.ts           inspects a built dist/ and reports rule compliance
src/
  components/           shared UI, including Icon.astro for all icons
  content/               Astro content collections
  data/                  static data: items, events, guest counts, food items
  layouts/
    BaseLayout.astro     head, canonical URL, header, footer for every page
  lib/                   shared types and helpers
  pages/                 route templates, most driven by [slug] style params
  styles/                global CSS
public/
  fonts/                 self-hosted font files (see CLAUDE.md font rule)
  _redirects             Cloudflare Pages redirect rules
tests/                   Playwright specs
```

## Generators

`scripts/generateData.ts` and `scripts/generateFoodData.ts` read the static
data in `src/data/` and produce the page data consumed by the route
templates. Run them with:

```
npm run generate
```

`npm run build` calls this automatically before the Astro build, so you
rarely need to run it by hand except when iterating on a generator.

## Build

```
npm install
npm run build
```

Output goes to `dist/`. This is a static build; there is no server runtime.

## Tests

```
npm test
```

Runs the Playwright suite in `tests/` against a local dev server. Use
`npm run test:ui` for the interactive runner.

## Checks

```
npm run build
npm run check
```

`scripts/checkSite.ts` inspects the built `dist/` directory and prints a
PASS/FAIL table covering canonical URL format, trailing slashes on internal
links, sitemap consistency, one `<h1>` per page, absence of Google Fonts
references, absence of emoji, and self-hosted font weight. Only checks
listed in the file's `CHECKS_ENFORCED` array fail the build; the rest are
reported for visibility while the underlying issues get fixed.

## Deploy

The site deploys to Cloudflare Pages. Cloudflare builds from this repo with
`npm run build` and serves `dist/`. Two files in `public/` configure Pages
behavior directly, since anything in `public/` is copied to the root of
`dist/`:

- `_redirects` — apex-to-www and pages.dev-to-custom-domain redirects.
- `_headers` — not yet present. Add it here if the site needs custom response
  headers (caching, security headers, and so on).

## Environment variables

None yet. This section is a placeholder to extend as the site starts using
any (API keys, feature flags, and so on). Document each one here as it is
added, including whether it is required at build time or only in Cloudflare
Pages' runtime environment.
