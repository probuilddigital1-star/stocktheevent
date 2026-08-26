# Distribution features: embeddable calculator + per-page share images

Date: 2026-08-26
Branch: redesign-a

## Goal

Two distribution features for StockTheEvent: an embeddable version of the
calculator that other sites can iframe, and a generated Open Graph/Twitter
share image for every indexable calculator page.

## 1. Embeddable calculator

### `/embed/` (`src/pages/embed/index.astro`)

A standalone Astro page, not wrapped in `BaseLayout` (no header, footer, nav,
consent banner, or ads). It writes its own minimal `<html>`, importing
`../../styles/global.css` for tokens, fonts, and base rules, so it stays
visually identical to the rest of the site without duplicating any of it.

- Renders `<InteractiveCalculator compact />`. `InteractiveCalculator.astro`
  gains a `compact` boolean prop; when set it adds a `compact` class to
  `.calc-box`, and the component's own scoped `<style>` gets `.compact`
  overrides that tighten padding and gaps. This reuses the exact same
  markup, math, and client script as the homepage calculator ("same math
  through the same modules"), it just renders tighter. Target natural
  height at typical widths: roughly 620-640px, matching the recommended
  iframe height below.
- A visually-hidden `<h1>` ("Party drink calculator") sits above the
  calculator. `npm run check`'s `single-h1` rule is enforced; the calculator
  itself has no heading, so this page needs one that doesn't disturb the
  compact layout.
- Canonical: `withTrailingSlash`, currently inline in `BaseLayout.astro`, is
  extracted to `src/lib/canonical.ts` and imported by both `BaseLayout` and
  this page, so the embed page derives its own canonical the same way
  `BaseLayout` does rather than hand-writing one.
- `<meta name="robots" content="noindex, follow">`.
- Below the calculator result: a "Powered by Stock the Event" link,
  `target="_top"`, `rel="noopener"`. Its `href` is static in the markup —
  `https://www.stocktheevent.com/bar-setup/?utm_source=embed` — a stable,
  crawlable default. A small script watches `#detail-link` (the
  calculator's own CTA target, which already tracks the current
  drink/guest/occasion selection) via `MutationObserver` on its `href`
  attribute, and rewrites the powered-by link's `href` to
  `https://www.stocktheevent.com{that path}&utm_source=embed` whenever it
  changes.
- Analytics: calls the shared `initAnalytics` (see below) with
  `{ extraProps: { surface: 'embed' }, forceMemoryPersistence: true }`. No
  `ConsentBanner` is rendered — there is no reasonable UX for a consent
  banner inside a small third-party iframe. Persistence is always
  `'memory'` regardless of region: the widget runs as a third-party iframe
  on other people's sites, where cookies/localStorage are partitioned or
  blocked by most browsers anyway, so cookie persistence there only
  produces noise. Cookieless is the honest mode for it.
- `window.track` is still mirrored from `src/lib/track.ts` the same way
  `BaseLayout` does it, so `InteractiveCalculator`'s `define:vars` script
  can call `window.track?.(...)`.

### Shared analytics init: `src/lib/analytics.ts`

Extracted from `BaseLayout`'s inline script so the embed page does not
duplicate ~25 lines of PostHog init/consent logic.

```ts
interface InitAnalyticsOptions {
  /** Extra properties registered alongside { site: 'stocktheevent' }. */
  extraProps?: Record<string, unknown>;
  /** Force memory-only persistence regardless of region (used by the embed). */
  forceMemoryPersistence?: boolean;
}

export function initAnalytics(options?: InitAnalyticsOptions): void
```

Owns: the `PUBLIC_POSTHOG_KEY` presence check, computing consent-gated
persistence (`isRegulatedRegion()` + `getConsent()`, unless
`forceMemoryPersistence` is set), `posthog.init(...)`,
`posthog.register({ site: 'stocktheevent', ...extraProps })`, the explicit
`posthog.capture('$pageview')` (capture_pageview stays false on init, same
as today, since init happens after window-load), and setting
`window.posthog`. The `.catch(() => {})` no-op-on-blocked behavior is
preserved.

`BaseLayout.astro` calls `initAnalytics()` (no extras) in place of its
current inline `posthog-js` import/init block. It keeps its own
`isRegulatedRegion()`/`getConsent()` calls for the unrelated AdSense-gating
decision (`needsConsentGate` there is not removed, just no longer also used
for posthog persistence directly - the same computation now also lives
inside `initAnalytics`). This is a pure extraction: the computed
persistence value and all observable behavior for existing pages is
unchanged, so `tests/analytics.spec.ts` passes unmodified and shipped
behavior on regular pages does not change.

### `/embed-calculator/` (`src/pages/embed-calculator.astro`)

Normal indexable `BaseLayout` page, prose-style like `about.astro`:

- What the widget is, who it's for (planners, venues, rental companies,
  food and wedding blogs).
- A live preview: `<iframe src="/embed/" width="100%" height="640"
  title="Stock the Event calculator preview" loading="lazy"
  style="border:1px solid var(--ink)">`.
- A bordered `<pre>`/`<code>` block with the copy-paste snippet (iframe
  `height="640"`) and a Copy button, same clipboard pattern as
  `ShoppingChecklist.astro`'s copy button ("Copied" label swap for 2s).
- A one-line note under the snippet: on narrow screens the widget scrolls
  inside the frame rather than clipping.
- A line stating the widget is free and needs no attribution beyond the
  built-in link.
- Linked from `BaseLayout`'s footer Site column ("Embed the calculator")
  and from `about.astro`.

### Headers, indexing, sitemap

`public/_headers` gains:

```
/embed/*
  Content-Security-Policy: frame-ancestors *
```

`astro.config.mjs`'s sitemap filter gains `!page.includes('/embed')` so
`/embed/` (but not `/embed-calculator/`) is excluded.

## 2. Share images (satori + resvg)

### Fonts

Static TTFs downloaded into `scripts/fonts/` (not `public/fonts`, which
only has WOFF2): Archivo Regular + SemiBold, Libre Caslon Text Regular,
each with its OFL license text alongside it, all committed to the repo.

### `scripts/generateOg.ts`

Wired into `npm run generate`, run after both `generateData.ts` and
`generateFoodData.ts`. `satori` and `@resvg/resvg-js` are devDependencies.
A local hyperscript helper (`h(type, props, ...children)`) builds the
element trees satori expects, avoiding a dependency on `react`. Output:
`public/og/{slug}.png`, `public/og/` gitignored.

Shared card frame: `--paper` background, thin `--ink` rule separating the
main content from a small "Stock the Event" footer line. No gradients (also
keeps files tiny and flat-color PNGs compress well under the 150KB cap).

- **Drink/food cards** — every page where `isIndexable(guestCount)` is
  true: big number (Archivo 600, ~220px, tabular figures), unit line
  (Libre Caslon Text), "for a {N}-guest {event}" line.
- **Bar-setup cards** — every `event x` indexable guest count: same frame,
  the big-number block replaced by a small "Full bar" label over a 4-row
  ledger (wine/beer/champagne/spirits, tabular unit counts), keeping the
  "for a {N}-guest {event}" line.
- **Occasion cards** — one per `seasonalEvents` entry: the occasion's
  `shortName` as a Libre Caslon Text headline, then the same 4-row ledger
  computed at 100 guests for that occasion's base event (`eventType`
  resolved through `events`), then the standard footer. 100 guests to match
  the guest count already quoted in hub intros.
- **Default card** — replaces `public/og-default.png` (filename kept):
  "Stock the Event" wordmark + "Party quantity calculators" tagline.

Caching: a PNG is skipped when it already exists and its mtime is newer
than both `generateOg.ts`'s own mtime and the relevant data file(s) mtime
(the page's generated JSON under `src/content/calculators/` or
`src/content/food-calculators/` for drink/food cards; the max of
`events.ts`/`guestCounts.ts`/`model.ts`/`eventSplits.ts`/`items.ts` for
bar-setup cards; `seasonalEvents.ts` for occasion cards). Including the
script's own mtime means editing the rendering logic invalidates
previously-cached images too.

Size cap: 150KB per PNG. Given the flat design this should not trigger in
practice; if a render exceeds it, the script re-renders at a proportionally
smaller pixel size as a fallback and logs which slug needed it.

### Wiring into pages

`BaseLayout.astro` gains an `ogImageAlt` prop, rendered as
`<meta property="og:image:alt" content={ogImageAlt} />`.
`twitter:card`/`twitter:image` already exist site-wide and already follow
whatever `ogImage` is passed, so no change needed there.

`src/pages/[slug].astro`, `src/pages/food/[slug].astro`,
`src/pages/bar-setup/[...slug].astro`, and `src/pages/party/[eventSlug].astro`
each pass `ogImage={/og/{slug}.png}` and `ogImageAlt` (the page's own H1 text)
only when the page is indexable (`isIndexable(guestCount)` for drink/food/
bar-setup pages; always for occasion pages, which have no guest-count
variants). Otherwise the prop is omitted and `BaseLayout`'s existing
`/og-default.png` default applies, satisfying "noindexed guest counts get
no image and keep the default."

## 3. Checks

`scripts/ops/verifyLive.ts` gains two checks:

- The `og:image` meta on `/wine-for-wedding-100-guests/` (parsed from the
  live page, not a hardcoded image path) returns 200 and is under 150KB.
- `/embed/` returns 200 and its response headers include the
  `frame-ancestors` CSP directive.

New Playwright spec `tests/embed.spec.ts`: `/embed-calculator/` renders an
iframe pointed at `/embed/`, and the snippet block's text contains the
`/embed/` URL.

## 4. Everything else

`CONTENT_UPDATED` in `src/data/site.ts` bumps to `2026-08-26`.

Verification sequence: `npm run build` (timing the image-generation step
separately from the rest), `npm run check`, `npm test`. Commit as
"Distribution: embeddable calculator, per-page share images, Bar book
default share image". Then `git checkout main`, `git merge --ff-only
redesign-a`, `npm run deploy`, `npm run verify:live`, `git checkout
redesign-a`.
