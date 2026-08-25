# StockTheEvent

Party quantity calculators. Given an event type, a drink or food item, and a
guest count, the site tells you how much to buy. Live at
https://www.stocktheevent.com/.

See `CLAUDE.md` for the rules every change in this repo must follow, and for
the target design token system.

## Structure

```
docs/                    planning docs: PRDs, user stories, audits
scripts/
  generateData.ts       drink calculator page data
  generateFoodData.ts   food calculator page data
  checkSite.ts           inspects a built dist/ and reports rule compliance
src/
  components/           shared UI, including Icon.astro for all icons
  content/               generated page data (gitignored, see Generators)
  data/                  static data: items, events, guest counts, food items,
                         indexing thresholds
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
templates. Run both with:

```
npm run generate
```

The output, `src/content/calculators/*.json` and
`src/content/food-calculators/*.json`, is derived data. It is gitignored and
not committed; never hand-edit it. `npm run build` and `npm run dev` (via
`predev`) both run `npm run generate` first, so the JSON is always in place
before Astro reads it.

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

- `_redirects`: apex-to-www and pages.dev-to-custom-domain redirects.
- `_headers`: cache-control headers, long-lived immutable caching for
  `/_astro/*` and `/fonts/*`, no caching for everything else.

## Environment variables

None yet. This section is a placeholder to extend as the site starts using
any (API keys, feature flags, and so on). Document each one here as it is
added, including whether it is required at build time or only in Cloudflare
Pages' runtime environment.
