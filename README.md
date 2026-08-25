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
  ops/                   deploy, live verification, Cloudflare and Search
                         Console/Bing tooling (see Ops toolkit below)
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

The site is a Cloudflare Pages project named `stocktheevent`. Two files in
`public/` configure Pages behavior directly, since anything in `public/` is
copied to the root of `dist/`:

- `_redirects`: apex-to-www and pages.dev-to-custom-domain redirects.
- `_headers`: cache-control headers, long-lived immutable caching for
  `/_astro/*` and `/fonts/*`, no caching for everything else.

Deploy from the command line:

```
npm run deploy
```

This builds, runs `npm run check`, and pushes `dist/` to Cloudflare Pages via
`scripts/ops/deploy.ts`, which runs `wrangler pages deploy` (`wrangler` is
invoked with `npx` and does not need to be installed separately). Deploys
authenticate with the `wrangler login` session on this machine, not
`CLOUDFLARE_API_TOKEN`: that variable is set in the environment for the
zone-scoped ops scripts below and must stay zone-scoped, so
`scripts/ops/deploy.ts` deliberately hides it (and `CLOUDFLARE_ACCOUNT_ID`)
from the wrangler child process, since wrangler prefers an API token over a stored
login session when one is present, and this ops token was never meant to
carry Pages/account permissions. If wrangler reports it isn't logged in, run
`npx wrangler login` once. Then confirm the live site actually reflects the
deploy:

```
npm run verify:live
```

`scripts/ops/verifyLive.ts` fetches the live site with cache-busting query
strings and prints a PASS/FAIL table: canonical URLs match the request URL,
noindex is present and absent on the expected pages, the live sitemap count
and guest counts match the local build, `/logo.png` and `/og-default.png`
are correct, the HTML `Cache-Control` header has `max-age=0`, and sampled
internal links keep their trailing slash. It exits non-zero on any failure.

A prompt is not done until `npm run deploy` has succeeded and
`npm run verify:live` passes.

## Ops toolkit

`scripts/ops/` holds command-line tooling for the housekeeping that would
otherwise mean clicking around the Cloudflare and Search Console dashboards.
Every script reads its secret from the environment, never writes one to a
file, and never logs one. Each exits with a plain message naming the
specific missing variable if that variable is not set, so it's safe to run
any of them without every credential configured.

### Cloudflare (`scripts/ops/cloudflare.ts`)

Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID`. Uses plain `fetch`
against `https://api.cloudflare.com/client/v4`, no SDK. Every subcommand is
idempotent: it reads the current value, changes it only if needed, reads it
back, and prints before/after.

```
tsx scripts/ops/cloudflare.ts settings   # Browser Cache TTL -> respect existing headers, Crawler Hints -> on
tsx scripts/ops/cloudflare.ts bots       # Bot Fight Mode -> on
tsx scripts/ops/cloudflare.ts waf        # create/update the "challenge-non-served-countries" custom rule only
tsx scripts/ops/cloudflare.ts purge      # purge everything for the zone
tsx scripts/ops/cloudflare.ts status     # print the current value of all of the above
```

If the token is missing a permission, the affected subcommand prints which
scope is missing and the script still runs the rest. Crawler Hints has no
documented, stable API endpoint as of this writing; if the API call for it
fails, enable it manually in the dashboard under Caching > Configuration.

### Google Search Console (`scripts/ops/gsc.ts`)

Requires `GOOGLE_APPLICATION_CREDENTIALS` pointing to a service account key
file (create one in Google Cloud Console, share the Search Console property
with its email address as a user). Uses the `googleapis` package against
property `sc-domain:stocktheevent.com`, falling back to
`https://www.stocktheevent.com/` if that domain property isn't accessible
to the service account.

```
tsx scripts/ops/gsc.ts submit-sitemap   # submit sitemap-index.xml
tsx scripts/ops/gsc.ts export           # reports/gsc-{queries,pages,daily}-16m.csv
tsx scripts/ops/gsc.ts inspect          # reports/gsc-inspection.csv, hub + sampled calculator URLs
```

`reports/` is gitignored; nothing written there is ever committed.

**"Validate fix" and "Request indexing" are not available through the
Search Console API.** They remain dashboard-only actions at
search.google.com/search-console.

### Bing Webmaster Tools (`scripts/ops/bing.ts`)

Requires `BING_WEBMASTER_API_KEY`. Get one from Bing Webmaster Tools:
sign in at bing.com/webmasters, open **Settings > API Access**, and generate
a key (one key per account, valid across all verified sites).

```
tsx scripts/ops/bing.ts submit-sitemap   # SubmitFeed for sitemap-index.xml
tsx scripts/ops/bing.ts status           # GetUserSites
```

## Environment variables

None required to build the site itself. The ops toolkit above reads these
at runtime, never at build time:

| Variable | Used by | Required for |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | `scripts/ops/cloudflare.ts` | all subcommands |
| `CLOUDFLARE_ZONE_ID` | `scripts/ops/cloudflare.ts` | all subcommands |
| `GOOGLE_APPLICATION_CREDENTIALS` | `scripts/ops/gsc.ts` | all subcommands |
| `BING_WEBMASTER_API_KEY` | `scripts/ops/bing.ts` | all subcommands |

Document any future variable here, including whether it's required at build
time or only in Cloudflare Pages' runtime environment.
