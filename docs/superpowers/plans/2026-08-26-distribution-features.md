# Distribution Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an embeddable version of the drink/food calculator (`/embed/` + a landing page at `/embed-calculator/`) and generate a Bar-book-styled Open Graph/Twitter share image for every indexable calculator page, with checks and tests covering both.

**Architecture:** The embed widget reuses `InteractiveCalculator.astro` directly (a new `compact` prop, not a copy) inside a standalone page that bypasses `BaseLayout`. Two small helpers (`src/lib/canonical.ts`, `src/lib/analytics.ts`) are extracted out of `BaseLayout.astro` so the embed page can reuse the same canonical-URL derivation and PostHog init without duplicating either. Share images are produced by a new build step, `scripts/generateOg.ts`, run after the existing data generators: it renders a 1200x630 card per page with `satori` (React-less JSX-shaped element trees to SVG) and rasterizes with `@resvg/resvg-js`, using static OFL TTFs (not the WOFF2s in `public/fonts`, which satori cannot use).

**Tech Stack:** Astro 5, TypeScript, Playwright, `satori` + `@resvg/resvg-js` (new devDependencies), `tsx` for build scripts.

**Spec:** `docs/superpowers/specs/2026-08-26-distribution-features-design.md`

## Global Constraints

- Every internal link ends with a trailing slash.
- Canonical URLs are derived from `Astro.site`, never hand-written into page data.
- Indexability comes from `src/data/indexing.ts`'s `isIndexable()`; noindex logic is not scattered across templates.
- `src/content/*.json` is generated, never hand-edited or committed.
- Bump `CONTENT_UPDATED` in `src/data/site.ts` when page content changes.
- No emoji, no CSS gradients/backdrop-filter/box-shadow/border-radius/transform-on-hover, no em dashes.
- Icons only through `src/components/Icon.astro`.
- At most two font families, self-hosted from `public/fonts` for the live site; fonts fetched for `scripts/generateOg.ts` are build-time only (never served) and live in `scripts/fonts/`, downloaded from Google Fonts' OFL-licensed static TTFs with their license text committed alongside them.
- Numbers use tabular figures.
- Copy is plain American English.
- Every generated page has exactly one `<h1>` (`npm run check`'s `single-h1` check is enforced/blocking).
- `npm run check` also enforces `canonical-format`, `internal-href-trailing-slash`, `sitemap-noindex-guest-pages`, `no-google-fonts`, `no-emoji`, `no-em-dash` — every new page must pass these.
- The embed widget's PostHog init always uses `persistence: 'memory'`, regardless of visitor region — it runs as a third-party iframe on other people's sites, where cookies/localStorage are partitioned or blocked by most browsers anyway.
- The `BaseLayout` extraction (canonical + analytics) must not change any observable behavior on existing pages: `tests/analytics.spec.ts` passes unmodified.

---

## Task 1: Extract `canonical.ts` and `analytics.ts`, wire into `BaseLayout`

Pure refactor, no new pages yet. `BaseLayout.astro` currently defines `withTrailingSlash` inline and does its own PostHog init/consent/register/capture inline in a `<script>` block; both need to be reusable by the embed page without duplicating logic.

**Files:**
- Create: `src/lib/canonical.ts`
- Create: `src/lib/analytics.ts`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: `withTrailingSlash(url: URL): string` from `src/lib/canonical.ts`.
- Produces: `initAnalytics(options?: { extraProps?: Record<string, unknown>; forceMemoryPersistence?: boolean }): void` from `src/lib/analytics.ts`.

- [ ] **Step 1: Baseline the test this refactor must not break**

Run: `npx playwright test tests/analytics.spec.ts`
Expected: both tests in the file PASS (this is the pre-refactor baseline).

- [ ] **Step 2: Create `src/lib/canonical.ts`**

```ts
/**
 * canonical.ts - derives a page's canonical URL from its resolved URL,
 * appending a trailing slash unless the path is already the root, already
 * slashed, or points at a file (has a "." in its last segment, e.g. an
 * asset or a sitemap XML file).
 *
 * Shared by BaseLayout (every normal page) and the standalone /embed/ page,
 * which bypasses BaseLayout, so canonical URLs are always derived the same
 * way rather than hand-written per page.
 */
export function withTrailingSlash(url: URL): string {
  const lastSegment = url.pathname.split('/').pop() ?? '';
  if (url.pathname === '/' || url.pathname.endsWith('/') || lastSegment.includes('.')) {
    return url.href;
  }
  return `${url.href}/`;
}
```

- [ ] **Step 3: Create `src/lib/analytics.ts`**

```ts
/**
 * analytics.ts - the one place PostHog gets initialized. BaseLayout calls
 * this with no options for every normal page; the standalone /embed/ page
 * (which bypasses BaseLayout) calls it with an extra registered property
 * and forced memory-only persistence, since it runs as a third-party
 * iframe on other people's sites where cookies/localStorage are
 * partitioned or blocked by most browsers anyway.
 */
import { isRegulatedRegion, getConsent } from './consent';

export interface InitAnalyticsOptions {
  /** Extra properties registered alongside { site: 'stocktheevent' }. */
  extraProps?: Record<string, unknown>;
  /** Force memory-only persistence regardless of region. */
  forceMemoryPersistence?: boolean;
}

export function initAnalytics(options: InitAnalyticsOptions = {}): void {
  const POSTHOG_KEY = import.meta.env.PUBLIC_POSTHOG_KEY;
  const POSTHOG_HOST = import.meta.env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
  if (!POSTHOG_KEY) return;

  // Cookieless until a visitor in a regulated region explicitly accepts;
  // outside the EU/UK, PostHog runs with its normal persistence.
  const needsConsentGate = isRegulatedRegion() && getConsent() !== 'accepted';
  const persistence = options.forceMemoryPersistence || needsConsentGate ? 'memory' : 'localStorage+cookie';

  import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: false,
        disable_session_recording: true,
        // This init runs after a dynamic import resolves, well past
        // posthog-js's own window-load detection, so its automatic
        // $pageview never fires. Captured explicitly below instead, once
        // the site property is registered, so it carries site too.
        capture_pageview: false,
        capture_pageleave: true,
        persistence,
      });
      posthog.register({ site: 'stocktheevent', ...options.extraProps });
      posthog.capture('$pageview');
      window.posthog = posthog;
    })
    .catch(() => {
      // Blocked (ad blocker, offline, etc). track() stays a no-op.
    });
}
```

- [ ] **Step 4: Replace the inline `withTrailingSlash` in `BaseLayout.astro`**

Remove this block (currently right after the `siteUrl` constant):

```ts
function withTrailingSlash(url: URL): string {
  const lastSegment = url.pathname.split('/').pop() ?? '';
  if (url.pathname === '/' || url.pathname.endsWith('/') || lastSegment.includes('.')) {
    return url.href;
  }
  return `${url.href}/`;
}

const resolvedCanonical = withTrailingSlash(new URL(Astro.url.pathname, Astro.site));
```

Replace with:

```ts
const resolvedCanonical = withTrailingSlash(new URL(Astro.url.pathname, Astro.site));
```

And add the import at the top of the frontmatter, alongside the other imports:

```ts
import { withTrailingSlash } from '../lib/canonical';
```

- [ ] **Step 5: Replace the inline PostHog init in `BaseLayout.astro`'s `<script>`**

Replace this block:

```html
    <script>
      import { track } from '../lib/track';
      import { isRegulatedRegion, getConsent } from '../lib/consent';
      import { loadAdSenseScript } from '../lib/ads';

      // Mirrored onto window: Astro's define:vars scripts (InteractiveCalculator,
      // [slug].astro, food/[slug].astro, ShoppingChecklist.astro) can't use
      // `import`, so they call window.track?.(...) instead.
      window.track = track;

      // The PostHog project is shared with another site; every event this
      // site sends is tagged so it can be told apart in shared dashboards.
      const SITE_PROPERTY = { site: 'stocktheevent' };

      const POSTHOG_KEY = import.meta.env.PUBLIC_POSTHOG_KEY;
      const POSTHOG_HOST = import.meta.env.PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
      const AD_NETWORK = import.meta.env.PUBLIC_AD_NETWORK || 'none';
      const ADSENSE_CLIENT = import.meta.env.PUBLIC_ADSENSE_CLIENT;

      const regulated = isRegulatedRegion();
      const consent = getConsent();
      // Cookieless until a visitor in a regulated region explicitly accepts;
      // outside the EU/UK, PostHog runs with its normal persistence.
      const needsConsentGate = regulated && consent !== 'accepted';

      if (POSTHOG_KEY) {
        import('posthog-js')
          .then(({ default: posthog }) => {
            posthog.init(POSTHOG_KEY, {
              api_host: POSTHOG_HOST,
              autocapture: false,
              disable_session_recording: true,
              // This init runs after a dynamic import resolves, well past
              // posthog-js's own window-load detection, so its automatic
              // $pageview never fires. Captured explicitly below instead,
              // once SITE_PROPERTY is registered, so it carries site too.
              capture_pageview: false,
              capture_pageleave: true,
              persistence: needsConsentGate ? 'memory' : 'localStorage+cookie',
            });
            posthog.register(SITE_PROPERTY);
            posthog.capture('$pageview');
            window.posthog = posthog;
          })
          .catch(() => {
            // Blocked (ad blocker, offline, etc). track() stays a no-op.
          });
      }

      if (AD_NETWORK === 'adsense' && ADSENSE_CLIENT && !needsConsentGate) {
        loadAdSenseScript(ADSENSE_CLIENT);
      }
```

With:

```html
    <script>
      import { track } from '../lib/track';
      import { isRegulatedRegion, getConsent } from '../lib/consent';
      import { loadAdSenseScript } from '../lib/ads';
      import { initAnalytics } from '../lib/analytics';

      // Mirrored onto window: Astro's define:vars scripts (InteractiveCalculator,
      // [slug].astro, food/[slug].astro, ShoppingChecklist.astro) can't use
      // `import`, so they call window.track?.(...) instead.
      window.track = track;

      const AD_NETWORK = import.meta.env.PUBLIC_AD_NETWORK || 'none';
      const ADSENSE_CLIENT = import.meta.env.PUBLIC_ADSENSE_CLIENT;

      const regulated = isRegulatedRegion();
      const consent = getConsent();
      // Cookieless until a visitor in a regulated region explicitly accepts;
      // outside the EU/UK, PostHog runs with its normal persistence.
      // initAnalytics makes this same computation internally for PostHog's
      // own persistence; it is kept here too since ad loading has its own
      // separate gate.
      const needsConsentGate = regulated && consent !== 'accepted';

      initAnalytics();

      if (AD_NETWORK === 'adsense' && ADSENSE_CLIENT && !needsConsentGate) {
        loadAdSenseScript(ADSENSE_CLIENT);
      }
```

Leave the rest of the script (the delegated affiliate-click tracking `document.addEventListener('click', ...)` block) untouched.

- [ ] **Step 6: Verify the refactor changed nothing observable**

Run: `npm run build && npm run check`
Expected: build succeeds, `canonical-format` check PASSes (same as before).

Run: `npx playwright test tests/analytics.spec.ts`
Expected: both tests PASS, identically to Step 1.

- [ ] **Step 7: Commit**

```bash
git add src/lib/canonical.ts src/lib/analytics.ts src/layouts/BaseLayout.astro
git commit -m "Refactor: extract canonical URL derivation and PostHog init into src/lib

Both BaseLayout and the upcoming embed page need to derive canonical
URLs and initialize PostHog the same way, without duplicating either."
```

---

## Task 2: `compact` prop on `InteractiveCalculator`, `/embed/` page, CSP header, sitemap exclusion

**Files:**
- Modify: `src/components/InteractiveCalculator.astro`
- Create: `src/pages/embed/index.astro`
- Modify: `public/_headers`
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: `withTrailingSlash` from `src/lib/canonical.ts` (Task 1), `initAnalytics` from `src/lib/analytics.ts` (Task 1), `track` from `src/lib/track.ts`.
- Produces: `InteractiveCalculator` prop `compact?: boolean` (default `false`), which callers pass to get a tighter-spaced render of the same component. `#detail-link` (already existed) remains the element other pages/scripts can observe for "what page does this calculator currently point to."

- [ ] **Step 1: Add the `compact` prop to `InteractiveCalculator.astro`**

In the frontmatter, right after the existing constants (`const DEFAULT_GUESTS = 100;` etc.), add:

```ts
interface Props {
  /** Tighter padding/gaps for the /embed/ widget. Same markup and math. */
  compact?: boolean;
}

const { compact = false } = Astro.props;
```

Change the root element from:

```astro
<div class="calc-box" id="calculator">
```

to:

```astro
<div class:list={['calc-box', { compact }]} id="calculator">
```

Add these rules at the end of the component's `<style>` block:

```css
  .calc-box.compact .calc-head {
    padding: 12px 20px;
  }

  .calc-box.compact .calc-inputs,
  .calc-box.compact .calc-results {
    padding: 20px 20px 18px;
    gap: 16px;
  }

  .calc-box.compact .calc-steppers {
    gap: 12px;
  }

  .calc-box.compact .drink-toggle-grid {
    gap: 8px;
  }

  .calc-box.compact .bar-table td {
    padding: 8px 0;
  }
```

- [ ] **Step 2: Create `src/pages/embed/index.astro`**

```astro
---
import '../../styles/global.css';
import InteractiveCalculator from '../../components/InteractiveCalculator.astro';
import { withTrailingSlash } from '../../lib/canonical';

const resolvedCanonical = withTrailingSlash(new URL(Astro.url.pathname, Astro.site));
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, follow" />
    <title>Stock the Event calculator</title>
    <link rel="canonical" href={resolvedCanonical} />

    <link rel="preload" href="/fonts/libre-caslon-text-400.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin />
  </head>
  <body class="embed-body">
    <h1 class="visually-hidden">Party drink calculator</h1>

    <InteractiveCalculator compact />

    <a
      id="powered-by-link"
      href="https://www.stocktheevent.com/bar-setup/?utm_source=embed"
      target="_top"
      rel="noopener"
      class="embed-powered-by"
    >Powered by Stock the Event</a>

    <script>
      import { track } from '../../lib/track';
      import { initAnalytics } from '../../lib/analytics';

      // Mirrored onto window the same way BaseLayout does it, so
      // InteractiveCalculator's define:vars script can call
      // window.track?.(...).
      window.track = track;

      // Third-party iframe on someone else's site: cookies/localStorage are
      // partitioned or blocked by most browsers there anyway, so always run
      // cookieless rather than trying to gate on region.
      initAnalytics({ extraProps: { surface: 'embed' }, forceMemoryPersistence: true });
    </script>

    <script>
      // The CTA link inside the calculator already tracks the current
      // drink/guest/occasion selection (single drink -> that drink's page,
      // multiple drinks -> the matching bar-setup page). Mirror its target
      // onto the powered-by link so "the matching calculator or bar-setup
      // page" stays accurate as the visitor changes the selection, while
      // the link still has a stable, crawlable href in the raw HTML.
      const detailLink = document.getElementById('detail-link');
      const poweredByLink = document.getElementById('powered-by-link');

      function syncPoweredByLink() {
        if (!detailLink || !poweredByLink) return;
        const href = detailLink.getAttribute('href');
        if (!href) return;
        const separator = href.includes('?') ? '&' : '?';
        poweredByLink.setAttribute('href', `https://www.stocktheevent.com${href}${separator}utm_source=embed`);
      }

      syncPoweredByLink();

      if (detailLink) {
        new MutationObserver(syncPoweredByLink).observe(detailLink, {
          attributes: true,
          attributeFilter: ['href'],
        });
      }
    </script>
  </body>
</html>

<style>
  .embed-body {
    margin: 0;
    padding: 10px;
  }

  .embed-powered-by {
    display: block;
    margin-top: 10px;
    text-align: center;
    font-size: 12px;
    color: var(--ink-2);
  }
</style>
```

- [ ] **Step 3: Add the CSP header rule to `public/_headers`**

Append to the end of the file:

```
/embed/*
  Content-Security-Policy: frame-ancestors *
```

- [ ] **Step 4: Exclude `/embed/` from the sitemap in `astro.config.mjs`**

Change the `filter` function from:

```js
    filter: (page) =>
      !page.includes('/privacy') &&
      !page.includes('/terms') &&
      !page.includes('/unsubscribe') &&
      !page.includes('/404') &&
      hasIndexableGuestCount(page),
```

to:

```js
    filter: (page) =>
      !page.includes('/privacy') &&
      !page.includes('/terms') &&
      !page.includes('/unsubscribe') &&
      !page.includes('/404') &&
      !page.includes('/embed/') &&
      hasIndexableGuestCount(page),
```

(`'/embed-calculator/'.includes('/embed/')` is `false` - the landing page is unaffected.)

- [ ] **Step 5: Build and verify**

Run: `npm run build && npm run check`
Expected: build succeeds; `single-h1`, `canonical-format`, `internal-href-trailing-slash`, `no-emoji`, `no-em-dash` all PASS.

Then inspect the built output directly:

Run: `grep -c "<h1" dist/embed/index.html`
Expected: `1`

Run: `grep "og:image\|noindex\|rel=\"canonical\"" dist/embed/index.html`
Expected: a `noindex` robots meta tag and a canonical `href="https://www.stocktheevent.com/embed/"`; no `og:image` tag (the embed page intentionally has none).

Run: `grep -A1 "^/embed/\*" public/_headers`
Expected: shows the `Content-Security-Policy: frame-ancestors *` line.

Run: `grep -c "stocktheevent.com/embed/" dist/sitemap-0.xml`
Expected: `0` (excluded from the sitemap).

- [ ] **Step 6: Commit**

```bash
git add src/components/InteractiveCalculator.astro src/pages/embed/index.astro public/_headers astro.config.mjs
git commit -m "Embed: standalone /embed/ calculator widget for iframing

Reuses InteractiveCalculator via a new compact prop, so the embed has
the exact same math and markup as the homepage calculator. Noindexed,
excluded from the sitemap, served with a permissive frame-ancestors
CSP so any site can iframe it."
```

---

## Task 3: `/embed-calculator/` landing page, footer and About links

**Files:**
- Create: `src/pages/embed-calculator.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/about.astro`

**Interfaces:**
- Consumes: `/embed/` (Task 2) as the iframe `src` and the base of the snippet.
- Produces: element ids `#embed-snippet-code` (the `<pre>` holding the copy-paste snippet text) and `#embed-copy-btn`, which `tests/embed.spec.ts` (Task 10) reads.

- [ ] **Step 1: Create `src/pages/embed-calculator.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Icon from '../components/Icon.astro';

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Embed the calculator', url: '/embed-calculator/' },
];

const IFRAME_SNIPPET = `<iframe
  src="https://www.stocktheevent.com/embed/"
  width="100%"
  height="640"
  style="border:1px solid #1B1F1D;"
  title="Stock the Event calculator"
  loading="lazy"
></iframe>`;
---

<BaseLayout
  title="Embed the Party Calculator on Your Site, Free | StockTheEvent"
  description="Add the Stock the Event drink and food calculator to your own site with one iframe. Free, no signup, no attribution beyond the built-in link."
  breadcrumbs={breadcrumbs}
>
  <section class="container prose-page">
    <nav class="prose-crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span aria-hidden="true">/</span>
      <span>Embed the calculator</span>
    </nav>

    <h1 class="prose-h1">Embed the calculator on your site</h1>
    <p class="prose-lede">
      The same drink and food calculator that runs on this site, dropped
      into yours with one iframe.
    </p>

    <h2 class="prose-h2">Who it is for</h2>
    <p>
      Wedding and event planners, venues, rental companies, and food and
      wedding blogs that want to give their own visitors a working
      quantity calculator without building one.
    </p>

    <h2 class="prose-h2">Preview</h2>
    <div class="embed-preview">
      <iframe
        src="/embed/"
        width="100%"
        height="640"
        style="border:1px solid var(--ink);"
        title="Stock the Event calculator preview"
        loading="lazy"
      ></iframe>
    </div>

    <h2 class="prose-h2">The snippet</h2>
    <p>Copy this into your page. No signup, no API key.</p>
    <div class="embed-snippet-block">
      <pre class="embed-snippet" id="embed-snippet-code">{IFRAME_SNIPPET}</pre>
      <button type="button" id="embed-copy-btn" class="btn-secondary embed-copy-btn">
        <Icon name="copy" size={18} /> Copy
      </button>
    </div>
    <p class="embed-note">
      On narrow screens the widget scrolls inside the frame rather than
      being cut off.
    </p>

    <h2 class="prose-h2">Free to use</h2>
    <p>
      This widget is free to embed. No attribution is required beyond the
      built-in "Powered by Stock the Event" link inside the widget itself.
    </p>
  </section>
</BaseLayout>

<script>
  const copyBtn = document.getElementById('embed-copy-btn');
  const codeEl = document.getElementById('embed-snippet-code');

  copyBtn?.addEventListener('click', () => {
    const text = codeEl?.textContent ?? '';
    navigator.clipboard.writeText(text).then(() => {
      if (!(copyBtn instanceof HTMLButtonElement)) return;
      const original = copyBtn.innerHTML;
      copyBtn.textContent = 'Copied';
      setTimeout(() => {
        copyBtn.innerHTML = original;
      }, 2000);
    });
  });
</script>

<style>
  .prose-page {
    max-width: 44rem;
    padding-top: 40px;
    padding-bottom: 64px;
  }

  .prose-crumbs {
    display: flex;
    gap: 10px;
    font-size: 13px;
    color: var(--ink-2);
    margin-bottom: 24px;
  }

  .prose-crumbs a,
  .prose-crumbs span {
    color: var(--ink-2);
  }

  .prose-h1 {
    margin: 0 0 12px;
    font-size: 36px;
    line-height: 1.1;
  }

  @media (min-width: 900px) {
    .prose-h1 {
      font-size: 48px;
    }
  }

  .prose-lede {
    margin: 0 0 8px;
    font-size: 18px;
    color: var(--ink-2);
  }

  .prose-h2 {
    margin: 36px 0 12px;
    font-size: 24px;
    line-height: 1.2;
  }

  .prose-page p {
    line-height: 1.7;
    margin: 0 0 14px;
  }

  .embed-preview {
    border: 1px solid var(--rule);
    padding: 12px;
  }

  .embed-snippet-block {
    border: 1px solid var(--ink);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .embed-snippet {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: monospace;
    font-size: 13px;
    color: var(--ink);
  }

  .embed-copy-btn {
    align-self: flex-start;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
  }

  .embed-note {
    font-size: 13px;
    color: var(--ink-2);
  }
</style>
```

- [ ] **Step 2: Link from the footer's Site column in `BaseLayout.astro`**

Change:

```astro
        <div class="footer-col">
          <span class="label">Site</span>
          <a href="/methodology/">Methodology</a>
          <a href="/bar-setup/">Full bar</a>
          <a href={`/party/${featuredSeasonal.slug}/`}>{featuredSeasonal.shortName}</a>
          <a href="/about/">About</a>
        </div>
```

to:

```astro
        <div class="footer-col">
          <span class="label">Site</span>
          <a href="/methodology/">Methodology</a>
          <a href="/bar-setup/">Full bar</a>
          <a href={`/party/${featuredSeasonal.slug}/`}>{featuredSeasonal.shortName}</a>
          <a href="/embed-calculator/">Embed the calculator</a>
          <a href="/about/">About</a>
        </div>
```

- [ ] **Step 3: Link from `about.astro`**

Insert a new section between the "The formula" section and the "Our mission" section. Change:

```astro
    <p>
      Every constant in that formula is published, with worked examples and two
      outside comparisons, on the <a href="/methodology/">methodology page</a>.
    </p>

    <h2 class="prose-h2">Our mission</h2>
```

to:

```astro
    <p>
      Every constant in that formula is published, with worked examples and two
      outside comparisons, on the <a href="/methodology/">methodology page</a>.
    </p>

    <h2 class="prose-h2">Embed it on your site</h2>
    <p>
      The calculator is also free to <a href="/embed-calculator/">embed on your own site</a>,
      with no signup and no attribution required beyond the built-in link.
    </p>

    <h2 class="prose-h2">Our mission</h2>
```

- [ ] **Step 4: Build and verify**

Run: `npm run build && npm run check`
Expected: build succeeds; enforced checks PASS.

Run: `grep -c "<h1" dist/embed-calculator/index.html`
Expected: `1`

Run: `grep -c "embed-calculator" dist/index.html dist/about/index.html`
Wait, `dist/index.html` is the homepage, not the footer's location - the footer renders on every page. Run instead:

Run: `grep -c "/embed-calculator/" dist/about/index.html`
Expected: at least `2` (the footer link plus the new About section link).

- [ ] **Step 5: Commit**

```bash
git add src/pages/embed-calculator.astro src/layouts/BaseLayout.astro src/pages/about.astro
git commit -m "Embed: add indexable /embed-calculator/ landing page

Live preview, copy-paste snippet, and links from the footer and About
page."
```

---

## Task 4: Download OFL fonts for satori into `scripts/fonts/`

Satori (used by `scripts/generateOg.ts`, Task 5) needs static TTF/OTF font files; the WOFF2s in `public/fonts` are a variable font (Archivo) and cannot be used to render a specific static weight. These exact URLs were verified to return valid TrueType font data before writing this plan.

**Files:**
- Create: `scripts/fonts/Archivo-Regular.ttf`
- Create: `scripts/fonts/Archivo-SemiBold.ttf`
- Create: `scripts/fonts/LibreCaslonText-Regular.ttf`
- Create: `scripts/fonts/OFL-archivo.txt`
- Create: `scripts/fonts/OFL-librecaslontext.txt`

- [ ] **Step 1: Download the fonts and their license texts**

```bash
mkdir -p scripts/fonts
curl -sL -o scripts/fonts/Archivo-Regular.ttf "https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNDNZ9xds.ttf"
curl -sL -o scripts/fonts/Archivo-SemiBold.ttf "https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTT6jRZ9xds.ttf"
curl -sL -o scripts/fonts/LibreCaslonText-Regular.ttf "https://fonts.gstatic.com/s/librecaslontext/v5/DdT878IGsGw1aF1JU10PUbTvNNaDMfq41-c.ttf"
curl -sL -o scripts/fonts/OFL-archivo.txt "https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/OFL.txt"
curl -sL -o scripts/fonts/OFL-librecaslontext.txt "https://raw.githubusercontent.com/google/fonts/main/ofl/librecaslontext/OFL.txt"
```

- [ ] **Step 2: Verify the downloads**

Run: `file scripts/fonts/*.ttf`
Expected: all three report `TrueType Font data`.

Run: `head -3 scripts/fonts/OFL-archivo.txt scripts/fonts/OFL-librecaslontext.txt`
Expected: both start with `Copyright` and reference the SIL Open Font License.

- [ ] **Step 3: Commit**

```bash
git add scripts/fonts/
git commit -m "Add OFL static TTFs for satori-rendered share images

satori needs static TTF/OTF fonts and cannot use the variable WOFF2s
in public/fonts. These are build-time only, never served to the site."
```

---

## Task 5: `scripts/generateOg.ts` core - render pipeline, default card, wiring

Establishes the satori/resvg rendering pipeline, the shared card frame, the freshness/caching check, the 150KB size cap with a downscale fallback, and the default card (replacing `public/og-default.png`). Drink/food cards (Task 6) and bar-setup/occasion cards (Task 7) build on this file.

**Files:**
- Create: `scripts/generateOg.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces (used by Task 6 and Task 7, appended to the same file): `h(type, props, ...children)` hyperscript helper; `PAPER`/`INK`/`INK_2`/`RULE`/`FONT_DISPLAY`/`FONT_TEXT` constants; `cardFrame(...children)`, `cardFooter()`, `bigNumberCard({ big, unit, context })`, `ledgerCard({ headline?, caption, rows, context })` card builders (`rows: { label: string; value: string }[]`); `writeCard(outputPath: string, dataPaths: string[], build: () => SatoriNode): Promise<{ status: 'written' | 'skipped'; bytes: number }>`; `OG_DIR`, `PUBLIC_DIR` path constants; `SCRIPT_MTIME` (this file's own mtime, used by every freshness check).

- [ ] **Step 1: Install the new devDependencies**

```bash
npm install --save-dev satori @resvg/resvg-js
```

- [ ] **Step 2: Wire the new step into `npm run generate`**

In `package.json`, change:

```json
    "generate": "tsx scripts/generateData.ts && tsx scripts/generateFoodData.ts",
```

to:

```json
    "generate": "tsx scripts/generateData.ts && tsx scripts/generateFoodData.ts && tsx scripts/generateOg.ts",
```

- [ ] **Step 3: Gitignore the generated images**

In `.gitignore`, in the "generated page data" section, add a line so it reads:

```
# generated page data (npm run generate)
src/content/calculators/
src/content/food-calculators/
public/og/
```

- [ ] **Step 4: Write `scripts/generateOg.ts`**

```ts
/**
 * generateOg.ts - renders a 1200x630 Bar-book-styled share image for every
 * indexable calculator page, plus the site default. Run after
 * generateData.ts and generateFoodData.ts (their JSON output feeds the
 * drink/food cards).
 *
 * satori builds an SVG from a React-less element tree (plain
 * { type, props: { style, children } } objects, built with the h() helper
 * below); @resvg/resvg-js rasterizes that SVG to PNG. satori needs static
 * TTF/OTF fonts, loaded once from scripts/fonts/ and reused for every
 * render, and its layout engine is flexbox-only - every element with
 * children must set display: 'flex' explicitly.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const OG_DIR = path.join(PUBLIC_DIR, 'og');
const FONTS_DIR = path.join(__dirname, 'fonts');

/** This file's own mtime. Included in every freshness check below, so
 * editing the rendering logic invalidates every previously-cached image,
 * not just edits to the underlying data. */
const SCRIPT_MTIME = fs.statSync(__filename).mtimeMs;

// =============================================================================
// Element tree helper (no react dependency)
// =============================================================================

interface SatoriNode {
  type: string;
  props: {
    style?: Record<string, string | number>;
    children?: SatoriNode | string | (SatoriNode | string)[];
    [key: string]: unknown;
  };
}

function h(
  type: string,
  props: Record<string, unknown> = {},
  ...children: (SatoriNode | string | null | false)[]
): SatoriNode {
  const flatChildren = children.filter((c): c is SatoriNode | string => c !== null && c !== false);
  return {
    type,
    props: {
      ...props,
      children: flatChildren.length === 1 ? flatChildren[0] : flatChildren,
    },
  };
}

// =============================================================================
// Fonts
// =============================================================================

const FONTS = [
  { name: 'Archivo', data: fs.readFileSync(path.join(FONTS_DIR, 'Archivo-Regular.ttf')), weight: 400 as const, style: 'normal' as const },
  { name: 'Archivo', data: fs.readFileSync(path.join(FONTS_DIR, 'Archivo-SemiBold.ttf')), weight: 600 as const, style: 'normal' as const },
  { name: 'Libre Caslon Text', data: fs.readFileSync(path.join(FONTS_DIR, 'LibreCaslonText-Regular.ttf')), weight: 400 as const, style: 'normal' as const },
];

// =============================================================================
// Card frame (Bar book style: paper background, thin ink rule, small
// wordmark footer)
// =============================================================================

const PAPER = '#F5F6F3';
const INK = '#1B1F1D';
const INK_2 = '#4B524E';
const RULE = '#C7CDC8';
const FONT_DISPLAY = 'Libre Caslon Text';
const FONT_TEXT = 'Archivo';

function cardFrame(...children: SatoriNode[]): SatoriNode {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '1200px',
        height: '630px',
        backgroundColor: PAPER,
        padding: '64px',
        fontFamily: FONT_TEXT,
      },
    },
    ...children,
  );
}

function cardFooter(): SatoriNode {
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column' } },
    h('div', { style: { display: 'flex', height: '1px', backgroundColor: INK, marginBottom: '24px' } }),
    h(
      'div',
      {
        style: {
          display: 'flex',
          fontFamily: FONT_DISPLAY,
          fontSize: '24px',
          color: INK_2,
          letterSpacing: '0.02em',
        },
      },
      'Stock the Event',
    ),
  );
}

function bigNumberCard(opts: { big: string; unit: string; context: string }): SatoriNode {
  return cardFrame(
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' } },
      h(
        'div',
        {
          style: {
            display: 'flex',
            fontFamily: FONT_TEXT,
            fontWeight: 600,
            fontSize: '220px',
            lineHeight: 1,
            color: INK,
            fontVariantNumeric: 'tabular-nums',
          },
        },
        opts.big,
      ),
      h(
        'div',
        { style: { display: 'flex', fontFamily: FONT_DISPLAY, fontSize: '44px', color: INK, marginTop: '8px' } },
        opts.unit,
      ),
      h(
        'div',
        { style: { display: 'flex', fontFamily: FONT_TEXT, fontSize: '28px', color: INK_2, marginTop: '16px' } },
        opts.context,
      ),
    ),
    cardFooter(),
  );
}

interface LedgerRow {
  label: string;
  value: string;
}

function ledgerCard(opts: { headline?: string; caption: string; rows: LedgerRow[]; context: string }): SatoriNode {
  return cardFrame(
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' } },
      ...(opts.headline
        ? [
            h(
              'div',
              { style: { display: 'flex', fontFamily: FONT_DISPLAY, fontSize: '68px', color: INK, marginBottom: '20px' } },
              opts.headline,
            ),
          ]
        : []),
      h(
        'div',
        {
          style: {
            display: 'flex',
            fontFamily: FONT_TEXT,
            fontWeight: 600,
            fontSize: '20px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: INK_2,
            marginBottom: '16px',
          },
        },
        opts.caption,
      ),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        ...opts.rows.map((row) =>
          h(
            'div',
            {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: `1px solid ${RULE}`,
                width: '760px',
              },
            },
            h('div', { style: { display: 'flex', fontFamily: FONT_TEXT, fontSize: '30px', color: INK } }, row.label),
            h(
              'div',
              { style: { display: 'flex', fontFamily: FONT_TEXT, fontWeight: 600, fontSize: '30px', color: INK, fontVariantNumeric: 'tabular-nums' } },
              row.value,
            ),
          ),
        ),
      ),
      h(
        'div',
        { style: { display: 'flex', fontFamily: FONT_TEXT, fontSize: '28px', color: INK_2, marginTop: '20px' } },
        opts.context,
      ),
    ),
    cardFooter(),
  );
}

function defaultCard(): SatoriNode {
  return cardFrame(
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' } },
      h('div', { style: { display: 'flex', fontFamily: FONT_DISPLAY, fontSize: '110px', color: INK } }, 'Stock the Event'),
      h(
        'div',
        { style: { display: 'flex', fontFamily: FONT_TEXT, fontSize: '30px', color: INK_2, marginTop: '20px' } },
        'Party quantity calculators',
      ),
    ),
    h('div', { style: { display: 'flex', height: '1px', backgroundColor: INK, marginTop: 'auto' } }),
  );
}

// =============================================================================
// Render pipeline: satori (element tree -> SVG) -> resvg (SVG -> PNG)
// =============================================================================

const MAX_BYTES = 150 * 1024;

async function renderPng(tree: SatoriNode, widthPx: number): Promise<Buffer> {
  const svg = await satori(tree as any, { width: 1200, height: 630, fonts: FONTS });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: widthPx } });
  return resvg.render().asPng();
}

async function renderCardCapped(tree: SatoriNode): Promise<Buffer> {
  const buffer = await renderPng(tree, 1200);
  if (buffer.length <= MAX_BYTES) return buffer;
  // The flat, gradient-free card design should never hit this in practice.
  // Fall back to a smaller raster (still a valid og:image, just not the
  // full 1200x630) rather than shipping an oversized file.
  return renderPng(tree, 900);
}

function isFresh(outputPath: string, dataPaths: string[]): boolean {
  if (!fs.existsSync(outputPath)) return false;
  const outMtime = fs.statSync(outputPath).mtimeMs;
  if (outMtime <= SCRIPT_MTIME) return false;
  for (const dataPath of dataPaths) {
    if (!fs.existsSync(dataPath)) continue;
    if (outMtime <= fs.statSync(dataPath).mtimeMs) return false;
  }
  return true;
}

interface WriteResult {
  status: 'written' | 'skipped';
  bytes: number;
}

async function writeCard(outputPath: string, dataPaths: string[], build: () => SatoriNode): Promise<WriteResult> {
  if (isFresh(outputPath, dataPaths)) {
    return { status: 'skipped', bytes: fs.statSync(outputPath).size };
  }
  const buffer = await renderCardCapped(build());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  return { status: 'written', bytes: buffer.length };
}

// =============================================================================
// Default card
// =============================================================================

async function generateDefaultCard(): Promise<WriteResult> {
  const outputPath = path.join(PUBLIC_DIR, 'og-default.png');
  return writeCard(outputPath, [], defaultCard);
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  fs.mkdirSync(OG_DIR, { recursive: true });

  const results: WriteResult[] = [];
  results.push(await generateDefaultCard());

  const written = results.filter((r) => r.status === 'written').length;
  const largest = Math.max(...results.map((r) => r.bytes));
  console.log(`\nShare images: ${results.length} total, ${written} written, ${results.length - written} skipped (up to date).`);
  console.log(`Largest file: ${largest} bytes.`);
}

main();
```

- [ ] **Step 5: Run it and verify the default card**

Run: `npx tsx scripts/generateOg.ts`
Expected: prints `Share images: 1 total, 1 written, 0 skipped (up to date).` and a `Largest file: N bytes.` line.

Run: `file public/og-default.png && ls -la public/og-default.png`
Expected: reports `PNG image data, 1200 x 630`, and the file size is well under 150KB (the earlier `og-default.png` this replaces was already checked against a 300KB cap by `verifyLive.ts`'s existing `checkOgImageSize`, so a smaller flat-color replacement is expected to pass easily).

Run: `npx tsx scripts/generateOg.ts` again
Expected: prints `... 0 written, 1 skipped ...` (the freshness check works: rerunning without touching the script or any data leaves the existing file alone).

- [ ] **Step 6: Commit**

```bash
git add scripts/generateOg.ts package.json package-lock.json .gitignore public/og-default.png
git commit -m "Share images: satori/resvg render pipeline and default card

Adds satori and @resvg/resvg-js, wires scripts/generateOg.ts into
npm run generate, and replaces public/og-default.png with a generated
Bar-book-styled default card. Per-page cards land in later commits."
```

---

## Task 6: `generateOg.ts` - drink and food big-number cards

**Files:**
- Modify: `scripts/generateOg.ts`

**Interfaces:**
- Consumes: `writeCard`, `bigNumberCard`, `OG_DIR` from Task 5. `CalculatorPage`, `FoodCalculatorPage` types from `src/lib/types.ts`. `isIndexable` from `src/data/indexing.ts`. `items`, `foodItems`, `events`, `guestCounts` data modules.
- Produces: `generateDrinkCards()`, `generateFoodCards()`, both `(): Promise<WriteResult[]>`, called from `main()`.

- [ ] **Step 1: Add imports and directory constants near the top of `scripts/generateOg.ts`**

After the existing `FONTS_DIR` constant, add:

```ts
const CALCULATORS_DIR = path.join(__dirname, '../src/content/calculators');
const FOOD_CALCULATORS_DIR = path.join(__dirname, '../src/content/food-calculators');
```

Add these imports at the top of the file, alongside the existing `satori`/`Resvg` imports:

```ts
import { items } from '../src/data/items';
import { foodItems } from '../src/data/foodItems';
import { events } from '../src/data/events';
import { guestCounts } from '../src/data/guestCounts';
import { isIndexable } from '../src/data/indexing';
import type { CalculatorPage, FoodCalculatorPage } from '../src/lib/types';
```

- [ ] **Step 2: Add the drink and food card generators**

Insert this section right before the `// Main` section:

```ts
// =============================================================================
// Drink and food cards: big number + unit line + "for a N-guest event" line
// =============================================================================

const INDEXABLE_GUEST_COUNTS_LIST = guestCounts.filter((gc) => isIndexable(gc.value));

async function generateDrinkCards(): Promise<WriteResult[]> {
  const results: WriteResult[] = [];

  for (const item of items) {
    for (const event of events) {
      for (const guestCount of INDEXABLE_GUEST_COUNTS_LIST) {
        const slug = `${item.id}-for-${event.slug}-${guestCount.value}-guests`;
        const dataPath = path.join(CALCULATORS_DIR, `${slug}.json`);
        if (!fs.existsSync(dataPath)) continue;
        const page: CalculatorPage = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const outputPath = path.join(OG_DIR, `${slug}.png`);
        results.push(
          await writeCard(outputPath, [dataPath], () =>
            bigNumberCard({
              big: String(page.calculation.fullBar.unitsNeeded),
              unit: `${page.calculation.fullBar.unitsDisplay} of ${page.item.name.toLowerCase()}`,
              context: `for a ${page.guestCount.value}-guest ${page.event.lowerName}`,
            }),
          ),
        );
      }
    }
  }

  return results;
}

async function generateFoodCards(): Promise<WriteResult[]> {
  const results: WriteResult[] = [];

  for (const item of foodItems) {
    for (const event of events) {
      for (const guestCount of INDEXABLE_GUEST_COUNTS_LIST) {
        const slug = `${item.id}-for-${event.slug}-${guestCount.value}-guests`;
        const dataPath = path.join(FOOD_CALCULATORS_DIR, `${slug}.json`);
        if (!fs.existsSync(dataPath)) continue;
        const page: FoodCalculatorPage = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const outputPath = path.join(OG_DIR, `${slug}.png`);
        results.push(
          await writeCard(outputPath, [dataPath], () =>
            bigNumberCard({
              big: String(page.calculation.unitsNeeded),
              unit: `${page.calculation.unitsDisplay} of ${page.item.name.toLowerCase()}`,
              context: `for a ${page.guestCount.value}-guest ${page.event.lowerName}`,
            }),
          ),
        );
      }
    }
  }

  return results;
}
```

- [ ] **Step 3: Wire the new generators into `main()`**

Change:

```ts
  const results: WriteResult[] = [];
  results.push(await generateDefaultCard());
```

to:

```ts
  const results: WriteResult[] = [];
  results.push(await generateDefaultCard());
  results.push(...(await generateDrinkCards()));
  results.push(...(await generateFoodCards()));
```

- [ ] **Step 4: Run it and verify counts and a sample file**

Run: `npm run generate`
Expected: the two data generators run first, then `generateOg.ts` prints `Share images: 781 total, 781 written, 0 skipped (up to date).` (1 default + 4 items x 13 events x 6 indexable guest counts = 312, plus 6 food items x 13 events x 6 = 468; 1 + 312 + 468 = 781).

Run: `ls public/og | wc -l`
Expected: `780` (781 total minus the default card, which lives at `public/og-default.png`, not inside `public/og/`).

Run: `file public/og/wine-for-wedding-100-guests.png`
Expected: `PNG image data, 1200 x 630`.

Run: `npx tsx scripts/generateOg.ts`
Expected: `... 0 written, 781 skipped ...` - reruns without touching anything are a no-op.

- [ ] **Step 5: Commit**

```bash
git add scripts/generateOg.ts
git commit -m "Share images: generate drink and food big-number cards

One 1200x630 card per indexable drink and food calculator page."
```

---

## Task 7: `generateOg.ts` - bar-setup and occasion ledger cards

**Files:**
- Modify: `scripts/generateOg.ts`

**Interfaces:**
- Consumes: `writeCard`, `ledgerCard`, `OG_DIR` from Task 5; `items`, `events`, `guestCounts`, `isIndexable` from Task 6's imports.
- Produces: `computeFullBar(event, guestValue): { item: Item; unitsNeeded: number }[]`, `generateBarSetupCards()`, `generateOccasionCards()`, both `(): Promise<WriteResult[]>`, called from `main()`.

- [ ] **Step 1: Add imports**

Add to the existing import block:

```ts
import { seasonalEvents } from '../src/data/seasonalEvents';
import { drinkShare } from '../src/data/eventSplits';
import { BASE_DRINKS_PER_HOUR, BUFFER_PERCENTAGE, DRINKING_PERCENTAGE, consumptionMultiplier } from '../src/data/model';
import type { ExtendedEventType } from '../src/data/events';
```

- [ ] **Step 2: Add `computeFullBar` and the two card generators**

Insert this section right after `generateFoodCards` (before the `// Main` section):

```ts
// =============================================================================
// Bar-setup and occasion cards: shared 4-drink ledger
// =============================================================================

/** Mirrors src/pages/bar-setup/[...slug].astro's fullBarResults computation. */
function computeFullBar(event: ExtendedEventType, guestValue: number): { item: (typeof items)[number]; unitsNeeded: number }[] {
  const guestData = guestCounts.find((g) => g.value === guestValue)!;
  const drinkingPct = DRINKING_PERCENTAGE[guestData.tier];
  const actualDrinkers = guestValue * drinkingPct;
  const consumptionMult = consumptionMultiplier(event.defaultDuration);

  return items.map((item) => {
    const modifier = event.modifiers[item.id] || 1.0;
    const totalServings = Math.round(actualDrinkers * BASE_DRINKS_PER_HOUR * consumptionMult * modifier);
    const share = drinkShare(event.id, item.id);
    const servings = Math.round(totalServings * share);
    const unitsNeeded = Math.ceil((servings / item.servingsPerUnit) * (1 + BUFFER_PERCENTAGE));
    return { item, unitsNeeded };
  });
}

function ledgerRows(fullBar: { item: (typeof items)[number]; unitsNeeded: number }[]): LedgerRow[] {
  return fullBar.map((r) => ({
    label: r.item.name,
    value: `${r.unitsNeeded} ${r.unitsNeeded === 1 ? r.item.unitSingular : r.item.unit}`,
  }));
}

const BAR_SETUP_DATA_FILES = [
  path.join(__dirname, '../src/data/events.ts'),
  path.join(__dirname, '../src/data/guestCounts.ts'),
  path.join(__dirname, '../src/data/model.ts'),
  path.join(__dirname, '../src/data/eventSplits.ts'),
  path.join(__dirname, '../src/data/items.ts'),
];

async function generateBarSetupCards(): Promise<WriteResult[]> {
  const results: WriteResult[] = [];

  for (const event of events) {
    for (const guestCount of INDEXABLE_GUEST_COUNTS_LIST) {
      const slug = `${event.slug}-${guestCount.value}-guests`;
      const fullBar = computeFullBar(event, guestCount.value);
      const outputPath = path.join(OG_DIR, `${slug}.png`);
      results.push(
        await writeCard(outputPath, BAR_SETUP_DATA_FILES, () =>
          ledgerCard({
            caption: 'Full bar',
            rows: ledgerRows(fullBar),
            context: `for a ${guestCount.value}-guest ${event.lowerName}`,
          }),
        ),
      );
    }
  }

  return results;
}

const OCCASION_DATA_FILES = [path.join(__dirname, '../src/data/seasonalEvents.ts'), ...BAR_SETUP_DATA_FILES];

async function generateOccasionCards(): Promise<WriteResult[]> {
  const results: WriteResult[] = [];

  for (const seasonalEvent of seasonalEvents) {
    const baseEvent = events.find((e) => e.id === seasonalEvent.eventType);
    if (!baseEvent) continue;
    const fullBar = computeFullBar(baseEvent, 100);
    const outputPath = path.join(OG_DIR, `${seasonalEvent.slug}.png`);
    results.push(
      await writeCard(outputPath, OCCASION_DATA_FILES, () =>
        ledgerCard({
          headline: seasonalEvent.shortName,
          caption: 'Full bar',
          rows: ledgerRows(fullBar),
          context: 'for 100 guests',
        }),
      ),
    );
  }

  return results;
}
```

- [ ] **Step 3: Wire the new generators into `main()`**

Change:

```ts
  results.push(...(await generateDrinkCards()));
  results.push(...(await generateFoodCards()));
```

to:

```ts
  results.push(...(await generateDrinkCards()));
  results.push(...(await generateFoodCards()));
  results.push(...(await generateBarSetupCards()));
  results.push(...(await generateOccasionCards()));
```

- [ ] **Step 4: Run it and verify counts and a sample file**

Run: `npx tsx scripts/generateOg.ts`
Expected: prints `Share images: 872 total, 91 written, 781 skipped (up to date).` (781 from Task 6 already on disk and unchanged, plus 13 events x 6 indexable guest counts = 78 bar-setup cards, plus 13 occasion cards = 91 new).

Run: `ls public/og | wc -l`
Expected: `871` (780 from Task 6 plus 91 new).

Run: `file public/og/wedding-100-guests.png public/og/super-bowl-party-calculator.png`
Expected: both `PNG image data, 1200 x 630`.

- [ ] **Step 5: Commit**

```bash
git add scripts/generateOg.ts
git commit -m "Share images: generate bar-setup and occasion ledger cards

Bar-setup cards show the four drink figures as a small ledger instead
of one big number; occasion cards headline the occasion name over the
same ledger computed at 100 guests."
```

---

## Task 8: Wire `ogImage`/`ogImageAlt` into the four page templates, bump `CONTENT_UPDATED`

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/[slug].astro`
- Modify: `src/pages/food/[slug].astro`
- Modify: `src/pages/bar-setup/[...slug].astro`
- Modify: `src/pages/party/[eventSlug].astro`
- Modify: `src/data/site.ts`

**Interfaces:**
- Consumes: `public/og/{slug}.png` files from Tasks 6-7 (filenames must match each page's own `slug` exactly).
- Produces: `BaseLayout` prop `ogImageAlt?: string` (default `'StockTheEvent party quantity calculators'`), rendered as `<meta property="og:image:alt" ...>`.

- [ ] **Step 1: Add `ogImageAlt` to `BaseLayout.astro`**

Change the `Props` interface from:

```ts
interface Props {
  title: string;
  description: string;
  ogImage?: string;
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Where the header "Try the calculator" link points. The homepage passes
   * "#calculator" to scroll to its own calculator; calculator pages pass the
   * bar-setup page for their event.
   */
  calculatorHref?: string;
}

const {
  title,
  description,
  ogImage = '/og-default.png',
  breadcrumbs,
  calculatorHref = '/#calculator',
} = Astro.props;
```

to:

```ts
interface Props {
  title: string;
  description: string;
  ogImage?: string;
  ogImageAlt?: string;
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Where the header "Try the calculator" link points. The homepage passes
   * "#calculator" to scroll to its own calculator; calculator pages pass the
   * bar-setup page for their event.
   */
  calculatorHref?: string;
}

const {
  title,
  description,
  ogImage = '/og-default.png',
  ogImageAlt = 'StockTheEvent party quantity calculators',
  breadcrumbs,
  calculatorHref = '/#calculator',
} = Astro.props;
```

Change:

```astro
    <meta property="og:image" content={`${siteUrl}${ogImage}`} />
    <meta property="og:url" content={resolvedCanonical} />
```

to:

```astro
    <meta property="og:image" content={`${siteUrl}${ogImage}`} />
    <meta property="og:image:alt" content={ogImageAlt} />
    <meta property="og:url" content={resolvedCanonical} />
```

- [ ] **Step 2: Wire drink pages in `src/pages/[slug].astro`**

Change:

```astro
<BaseLayout
  title={page.meta.title}
  description={page.meta.description}
  breadcrumbs={breadcrumbs}
  calculatorHref={barSetupHref}
>
```

to:

```astro
<BaseLayout
  title={page.meta.title}
  description={page.meta.description}
  breadcrumbs={breadcrumbs}
  calculatorHref={barSetupHref}
  ogImage={isIndexable(page.guestCount.value) ? `/og/${page.slug}.png` : undefined}
  ogImageAlt={page.meta.h1}
>
```

(`isIndexable` is already imported in this file.)

- [ ] **Step 3: Wire food pages in `src/pages/food/[slug].astro`**

`isIndexable` is already imported in this file (used for its existing noindex meta tag). Change:

```astro
<BaseLayout
  title={page.meta.title}
  description={page.meta.description}
  breadcrumbs={breadcrumbs}
  calculatorHref={barSetupHref}
>
```

to:

```astro
<BaseLayout
  title={page.meta.title}
  description={page.meta.description}
  breadcrumbs={breadcrumbs}
  calculatorHref={barSetupHref}
  ogImage={isIndexable(page.guestCount.value) ? `/og/${page.slug}.png` : undefined}
  ogImageAlt={page.meta.h1}
>
```

- [ ] **Step 4: Wire bar-setup pages in `src/pages/bar-setup/[...slug].astro`**

Add the import alongside the existing `isIndexable` import (already present in this file for the noindex meta tag). Change:

```astro
<BaseLayout
  title={`${event.name} Alcohol Calculator: ${guestCount} Guests (Wine, Beer, Spirits, Champagne)`}
  description={`A full bar for ${guestCount} guests at a ${event.lowerName} is about ${grandTotalServings} servings, ${perPerson} drinks per person. Wine, beer, spirits and champagne quantities with a 15 percent buffer included.`}
>
```

to:

```astro
<BaseLayout
  title={`${event.name} Alcohol Calculator: ${guestCount} Guests (Wine, Beer, Spirits, Champagne)`}
  description={`A full bar for ${guestCount} guests at a ${event.lowerName} is about ${grandTotalServings} servings, ${perPerson} drinks per person. Wine, beer, spirits and champagne quantities with a 15 percent buffer included.`}
  ogImage={isIndexable(guestCount) ? `/og/${event.slug}-${guestCount}-guests.png` : undefined}
  ogImageAlt={`${event.name} full bar for ${guestCount} guests`}
>
```

- [ ] **Step 5: Wire occasion pages in `src/pages/party/[eventSlug].astro`**

Change:

```astro
<BaseLayout
  title={`${seasonalEvent.metaTitle} ${buildYear}`}
  description={seasonalEvent.metaDescription}
  calculatorHref={baseEvent ? `/bar-setup/${baseEvent.slug}-${defaultGuestCount}-guests/` : undefined}
>
```

to:

```astro
<BaseLayout
  title={`${seasonalEvent.metaTitle} ${buildYear}`}
  description={seasonalEvent.metaDescription}
  calculatorHref={baseEvent ? `/bar-setup/${baseEvent.slug}-${defaultGuestCount}-guests/` : undefined}
  ogImage={`/og/${seasonalEvent.slug}.png`}
  ogImageAlt={seasonalEvent.h1}
>
```

(Occasion pages have no guest-count variants, so they always get an image - no `isIndexable` gate needed here.)

- [ ] **Step 6: Bump `CONTENT_UPDATED`**

In `src/data/site.ts`, change:

```ts
export const CONTENT_UPDATED = '2026-08-25';
```

to:

```ts
export const CONTENT_UPDATED = '2026-08-26';
```

- [ ] **Step 7: Build and verify**

Run: `npm run build && npm run check`
Expected: build succeeds; all enforced checks PASS.

Run: `grep "og:image" dist/wine-for-wedding-100-guests/index.html`
Expected: `og:image` content is `https://www.stocktheevent.com/og/wine-for-wedding-100-guests.png`, and an `og:image:alt` tag with non-empty content is present.

Run: `grep "og:image" "dist/wine-for-birthday-party-10-guests/index.html"`
Expected: `og:image` content is `https://www.stocktheevent.com/og-default.png` (10 guests is not in `INDEXABLE_GUEST_COUNTS`, so the prop was left undefined and the default applies).

Run: `grep "og:image" dist/bar-setup/wedding-100-guests/index.html`
Expected: `og:image` content is `https://www.stocktheevent.com/og/wedding-100-guests.png`.

Run: `grep "og:image" "dist/party/super-bowl-party-calculator/index.html"`
Expected: `og:image` content is `https://www.stocktheevent.com/og/super-bowl-party-calculator.png`.

- [ ] **Step 8: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/[slug].astro "src/pages/food/[slug].astro" "src/pages/bar-setup/[...slug].astro" "src/pages/party/[eventSlug].astro" src/data/site.ts
git commit -m "Share images: wire generated og:image into indexable pages

Drink, food, bar-setup, and occasion pages now point og:image and
twitter:image at their own generated card; noindexed guest counts
keep the site default."
```

---

## Task 9: `verifyLive.ts` checks for the wine page's share image and `/embed/`'s CSP header

**Files:**
- Modify: `scripts/ops/verifyLive.ts`

**Interfaces:**
- Consumes: `fetchFresh`, `fetchFreshBinary`, `CheckResult` (all already defined in this file).
- Produces: `checkWineOgImageSize()`, `checkEmbedFrameAncestors()`, both `(): Promise<CheckResult>`, added to `main()`'s `results` array.

- [ ] **Step 1: Add the two check functions**

Insert this section right after `checkOgImageSize` (before `checkCacheControlMaxAge0`):

```ts
async function checkWineOgImageSize(): Promise<CheckResult> {
  const MAX_BYTES = 150 * 1024;
  const PAGE_PATH = '/wine-for-wedding-100-guests/';
  try {
    const { body } = await fetchFresh(PAGE_PATH);
    const match = body.match(/<meta property="og:image" content="([^"]+)"/);
    const imageUrl = match?.[1];
    if (!imageUrl) {
      return {
        name: 'wine-og-image-under-150kb',
        passed: false,
        count: -1,
        detail: `${PAGE_PATH} has no og:image meta tag`,
      };
    }
    const { status, bytes } = await fetchFreshBinary(imageUrl);
    const ok = status === 200 && bytes < MAX_BYTES;
    return {
      name: 'wine-og-image-under-150kb',
      passed: ok,
      count: bytes,
      detail: `${imageUrl} is ${bytes} bytes (status ${status}), limit ${MAX_BYTES} bytes`,
    };
  } catch (err) {
    return { name: 'wine-og-image-under-150kb', passed: false, count: -1, detail: `fetch error: ${(err as Error).message}` };
  }
}

async function checkEmbedFrameAncestors(): Promise<CheckResult> {
  try {
    const { status, headers } = await fetchFresh('/embed/');
    const csp = headers.get('content-security-policy') ?? '';
    const ok = status === 200 && csp.includes('frame-ancestors');
    return {
      name: 'embed-frame-ancestors-header',
      passed: ok,
      count: ok ? 0 : 1,
      detail: `/embed/ returned status ${status}, Content-Security-Policy: "${csp}"`,
    };
  } catch (err) {
    return { name: 'embed-frame-ancestors-header', passed: false, count: 1, detail: `fetch error: ${(err as Error).message}` };
  }
}
```

- [ ] **Step 2: Add both to the `results` array in `main()`**

Change:

```ts
  const results: CheckResult[] = [
    await checkCanonicalMatchesUrl(),
    await checkNoindexPresent(),
    await checkNoindexAbsent(),
    await checkSitemapCount(),
    await checkSitemapGuestCounts(),
    await checkLogoReturns200(),
    await checkOgImageSize(),
    await checkCacheControlMaxAge0(),
    await checkAssetCacheControl(),
    await checkSampledHrefsTrailingSlash(),
  ];
```

to:

```ts
  const results: CheckResult[] = [
    await checkCanonicalMatchesUrl(),
    await checkNoindexPresent(),
    await checkNoindexAbsent(),
    await checkSitemapCount(),
    await checkSitemapGuestCounts(),
    await checkLogoReturns200(),
    await checkOgImageSize(),
    await checkWineOgImageSize(),
    await checkEmbedFrameAncestors(),
    await checkCacheControlMaxAge0(),
    await checkAssetCacheControl(),
    await checkSampledHrefsTrailingSlash(),
  ];
```

- [ ] **Step 3: Verify it runs (against the still-old live site, so both new checks are expected to FAIL until Task 11 deploys)**

Run: `npx tsx scripts/ops/verifyLive.ts`
Expected: the printed table includes rows named `wine-og-image-under-150kb` and `embed-frame-ancestors-header`. Both FAIL right now (the live site does not have this feature yet - `wine-og-image-under-150kb` fails because the live page's `og:image` is still `/og-default.png`, not under the new path structure being verified, or the check itself errors gracefully; `embed-frame-ancestors-header` fails with a 404 since `/embed/` is not live yet). This is expected; the script exits non-zero, which is correct behavior pre-deploy. Confirm the failure detail lines are readable and point at the right cause, not a script crash.

- [ ] **Step 4: Commit**

```bash
git add scripts/ops/verifyLive.ts
git commit -m "verify:live: check the wine page's share image and /embed/'s CSP header"
```

---

## Task 10: Playwright test for the embed landing page

**Files:**
- Create: `tests/embed.spec.ts`

**Interfaces:**
- Consumes: `/embed-calculator/` (Task 3), specifically its `iframe[src="/embed/"]` and `#embed-snippet-code` elements.

- [ ] **Step 1: Write `tests/embed.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.describe('Embed calculator landing page', () => {
  test('renders an iframe pointing at /embed/ and a snippet containing the /embed/ URL', async ({ page }) => {
    await page.goto('/embed-calculator/');

    const iframe = page.locator('iframe[src="/embed/"]');
    await expect(iframe).toHaveCount(1);

    const snippet = await page.locator('#embed-snippet-code').textContent();
    expect(snippet).toContain('/embed/');
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx playwright test tests/embed.spec.ts`
Expected: PASS.

- [ ] **Step 3: Run the full Playwright suite to confirm nothing else regressed**

Run: `npm test`
Expected: all specs PASS, including `tests/analytics.spec.ts` (unchanged since Task 1) and the new `tests/embed.spec.ts`.

- [ ] **Step 4: Commit**

```bash
git add tests/embed.spec.ts
git commit -m "test: /embed-calculator/ renders the iframe and a matching snippet"
```

---

## Task 11: Final verification, commit, merge, deploy, verify:live

**Files:** none (verification and git/deploy operations only).

- [ ] **Step 1: Full build, timing the image-generation step separately**

```bash
npx tsx scripts/generateData.ts && npx tsx scripts/generateFoodData.ts
time npx tsx scripts/generateOg.ts
time npx astro build
```

Record: the `generateOg.ts` time (this is "the build time added by the image step" to report), and the `astro build` time. Since `public/og/` is already fully populated and fresh from Tasks 6-7, this `generateOg.ts` run should report all-skipped and be fast; note in the report that a from-scratch run (empty `public/og/`) is the more representative number for "cost of the image step" and re-run it once with the cache cleared to get that number too:

```bash
rm -rf public/og public/og-default.png
time npx tsx scripts/generateOg.ts
```

- [ ] **Step 2: `npm run build`, `npm run check`, `npm test`**

Run: `npm run build`
Expected: succeeds (this repeats generation, which is fine - it's idempotent).

Run: `npm run check`
Expected: all enforced checks PASS.

Run: `npm test`
Expected: all Playwright specs PASS.

- [ ] **Step 3: Commit the final state**

```bash
git status
git add -A
git commit -m "Distribution: embeddable calculator, per-page share images, Bar book default share image"
```

(If `git status` shows nothing to commit beyond what Tasks 1-10 already committed, skip this step - there is no empty commit to make.)

- [ ] **Step 4: Merge to main and deploy**

```bash
git checkout main
git merge --ff-only redesign-a
npm run deploy
npm run verify:live
git checkout redesign-a
```

Expected: `npm run deploy` builds, checks, and deploys `dist/` to Cloudflare Pages production. `npm run verify:live` prints a PASS/FAIL table; every row, including the two new ones from Task 9, should now PASS against the live site.

- [ ] **Step 5: Report back**

Summarize for the user: the embed page URL (`https://www.stocktheevent.com/embed/`) and the exact iframe snippet from `/embed-calculator/`; the number of share images generated (871 in `public/og/` plus the regenerated `og-default.png`) and the largest file size observed; the `generateOg.ts` build time added (both the cached/no-op number and the from-scratch number); the response headers on `/embed/` (status, `content-security-policy`); and the full `verify:live` table.
