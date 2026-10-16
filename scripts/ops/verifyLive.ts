/**
 * verifyLive.ts - fetches the live site and checks it matches what was deployed.
 *
 * Run after the Cloudflare build of a push to main finishes, with a local
 * `npm run build` of the same commit (and on the same day, since the featured
 * occasion depends on the build date) present in dist/: `npm run verify:live`.
 * Exits non-zero if any check fails.
 */

import * as fs from 'fs';
import * as path from 'path';

const SITE = 'https://www.stocktheevent.com';
const DIST_DIR = path.join(process.cwd(), 'dist');

const SAMPLE_PATHS = [
  '/',
  '/calculators/wine/',
  '/wine-for-wedding/',
  '/food/pizza/',
  '/food/pizza-for-birthday-party/',
  '/party/cinco-de-mayo-party-calculator/',
  '/bar-setup/',
  '/bar-setup/fourth-of-july-party/',
  '/methodology/',
];

/** Old per-guest-count URLs and where they must 301 to. Slash and no-slash forms. */
const OLD_URL_REDIRECTS: { from: string; to: string }[] = [
  { from: '/wine-for-wedding-100-guests/', to: '/wine-for-wedding/' },
  { from: '/food/pizza-for-birthday-party-50-guests', to: '/food/pizza-for-birthday-party/' },
  { from: '/bar-setup/wedding-shower-125-guests/', to: '/bar-setup/wedding-shower/' },
];

/** A current URL whose name starts like an old one; it must stay a 200. */
const CURRENT_PATH_NEAR_RULE = '/bar-setup/wedding-shower/';

interface CheckResult {
  name: string;
  passed: boolean;
  count: number;
  detail: string;
}

function cacheBustUrl(url: string): string {
  const bust = `_cb=${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return url.includes('?') ? `${url}&${bust}` : `${url}?${bust}`;
}

async function fetchFresh(pathOrUrl: string): Promise<{ status: number; headers: Headers; body: string }> {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE}${pathOrUrl}`;
  const res = await fetch(cacheBustUrl(url), {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-store' },
  });
  const body = await res.text();
  return { status: res.status, headers: res.headers, body };
}

async function fetchFreshBinary(pathOrUrl: string): Promise<{ status: number; headers: Headers; bytes: number }> {
  const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${SITE}${pathOrUrl}`;
  const res = await fetch(cacheBustUrl(url), {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-store' },
  });
  const buf = await res.arrayBuffer();
  return { status: res.status, headers: res.headers, bytes: buf.byteLength };
}

function isInternalPageHref(href: string): boolean {
  if (!href.startsWith('/') || href.startsWith('//')) return false;
  const cleanPath = href.split('?')[0].split('#')[0];
  const lastSegment = cleanPath.split('/').pop() ?? '';
  if (lastSegment.includes('.')) return false; // asset file, not a page route
  return true;
}

async function checkCanonicalMatchesUrl(): Promise<CheckResult> {
  let failed = 0;
  const examples: string[] = [];
  for (const p of SAMPLE_PATHS) {
    try {
      const { body } = await fetchFresh(p);
      const match = body.match(/<link rel="canonical" href="([^"]+)"/);
      const expected = `${SITE}${p}`;
      if (!match || match[1] !== expected) {
        failed += 1;
        if (examples.length < 3) examples.push(`${p} -> ${match?.[1] ?? 'MISSING'} (expected ${expected})`);
      }
    } catch (err) {
      failed += 1;
      if (examples.length < 3) examples.push(`${p} -> fetch error: ${(err as Error).message}`);
    }
  }
  return {
    name: 'canonical-matches-url',
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${SAMPLE_PATHS.length} sampled pages have a canonical that does not equal the request URL${examples.length ? ` (e.g. ${examples.join('; ')})` : ''}`,
  };
}

async function checkNoindexAbsent(): Promise<CheckResult> {
  const indexedPath = '/beer-for-wedding/';
  try {
    const { body } = await fetchFresh(indexedPath);
    const hasNoindex = /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(body);
    return {
      name: 'calculator-page-indexable',
      passed: !hasNoindex,
      count: hasNoindex ? 1 : 0,
      detail: hasNoindex
        ? `${indexedPath} incorrectly has a noindex meta tag`
        : `${indexedPath} correctly has no noindex meta tag`,
    };
  } catch (err) {
    return { name: 'calculator-page-indexable', passed: false, count: 1, detail: `fetch error: ${(err as Error).message}` };
  }
}

async function fetchNoFollow(pathname: string): Promise<{ status: number; location: string | null }> {
  const res = await fetch(cacheBustUrl(`${SITE}${pathname}`), {
    redirect: 'manual',
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-store' },
  });
  await res.arrayBuffer();
  return { status: res.status, location: res.headers.get('location') };
}

async function checkOldUrlRedirects(): Promise<CheckResult> {
  const name = 'old-guest-count-urls-301';
  let failed = 0;
  const examples: string[] = [];
  for (const { from, to } of OLD_URL_REDIRECTS) {
    try {
      const { status, location } = await fetchNoFollow(from);
      const target = location ? new URL(location, SITE).pathname : null;
      if (status !== 301 || target !== to) {
        failed += 1;
        if (examples.length < 3) examples.push(`${from} -> ${status} ${target ?? 'no Location'} (expected 301 ${to})`);
      }
    } catch (err) {
      failed += 1;
      if (examples.length < 3) examples.push(`${from}: fetch error: ${(err as Error).message}`);
    }
  }
  try {
    const { status } = await fetchNoFollow(CURRENT_PATH_NEAR_RULE);
    if (status !== 200) {
      failed += 1;
      examples.push(`${CURRENT_PATH_NEAR_RULE} returned ${status}, expected 200`);
    }
  } catch (err) {
    failed += 1;
    examples.push(`${CURRENT_PATH_NEAR_RULE}: fetch error: ${(err as Error).message}`);
  }
  const total = OLD_URL_REDIRECTS.length + 1;
  return {
    name,
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${total} redirect checks failed (${OLD_URL_REDIRECTS.length} old URLs 301 to the clean page, ${CURRENT_PATH_NEAR_RULE} stays 200)${examples.length ? ` (e.g. ${examples.join('; ')})` : ''}`,
  };
}

function localSitemapUrls(): string[] | null {
  const sitemapPath = path.join(DIST_DIR, 'sitemap-0.xml');
  if (!fs.existsSync(sitemapPath)) return null;
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function checkSitemapCount(): Promise<CheckResult> {
  const local = localSitemapUrls();
  if (local === null) {
    return {
      name: 'sitemap-count-matches-local',
      passed: false,
      count: -1,
      detail: 'dist/sitemap-0.xml not found; run npm run build first',
    };
  }
  try {
    const { body } = await fetchFresh('/sitemap-0.xml');
    const liveUrls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const matches = liveUrls.length === local.length;
    return {
      name: 'sitemap-count-matches-local',
      passed: matches,
      count: Math.abs(liveUrls.length - local.length),
      detail: `live sitemap has ${liveUrls.length} URLs, local dist has ${local.length}`,
    };
  } catch (err) {
    return { name: 'sitemap-count-matches-local', passed: false, count: -1, detail: `fetch error: ${(err as Error).message}` };
  }
}

async function checkSitemapGuestCounts(): Promise<CheckResult> {
  try {
    const { body } = await fetchFresh('/sitemap-0.xml');
    const liveUrls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const guestUrls = liveUrls.filter((u) => /-(\d+)-guests\/?$/.test(u));
    return {
      name: 'sitemap-has-no-guest-count-urls',
      passed: guestUrls.length === 0 && liveUrls.length < 200,
      count: guestUrls.length,
      detail: `${guestUrls.length} guest-count URLs in a sitemap of ${liveUrls.length} (limit 199)${guestUrls.length ? ` (e.g. ${guestUrls.slice(0, 3).join(', ')})` : ''}`,
    };
  } catch (err) {
    return { name: 'sitemap-has-no-guest-count-urls', passed: false, count: -1, detail: `fetch error: ${(err as Error).message}` };
  }
}

async function checkLogoReturns200(): Promise<CheckResult> {
  try {
    const { status } = await fetchFreshBinary('/logo.png');
    return {
      name: 'logo-returns-200',
      passed: status === 200,
      count: status === 200 ? 0 : 1,
      detail: `/logo.png returned status ${status}`,
    };
  } catch (err) {
    return { name: 'logo-returns-200', passed: false, count: 1, detail: `fetch error: ${(err as Error).message}` };
  }
}

async function checkOgImageSize(): Promise<CheckResult> {
  const MAX_BYTES = 300 * 1024;
  try {
    const { status, bytes } = await fetchFreshBinary('/og-default.png');
    const ok = status === 200 && bytes < MAX_BYTES;
    return {
      name: 'og-image-under-300kb',
      passed: ok,
      count: bytes,
      detail: `/og-default.png is ${bytes} bytes (status ${status}), limit ${MAX_BYTES} bytes`,
    };
  } catch (err) {
    return { name: 'og-image-under-300kb', passed: false, count: -1, detail: `fetch error: ${(err as Error).message}` };
  }
}

async function checkWineOgImageSize(): Promise<CheckResult> {
  const MAX_BYTES = 150 * 1024;
  const PAGE_PATH = '/wine-for-wedding/';
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

async function checkCacheControlMaxAge0(): Promise<CheckResult> {
  try {
    const { headers } = await fetchFresh('/');
    const cacheControl = headers.get('cache-control') ?? '';
    const ok = cacheControl.includes('max-age=0');
    return {
      name: 'html-cache-control-max-age-0',
      passed: ok,
      count: ok ? 0 : 1,
      detail: `Cache-Control on / is "${cacheControl}"`,
    };
  } catch (err) {
    return { name: 'html-cache-control-max-age-0', passed: false, count: 1, detail: `fetch error: ${(err as Error).message}` };
  }
}

async function checkAssetCacheControl(): Promise<CheckResult> {
  const name = 'astro-asset-cache-immutable';
  try {
    const { body } = await fetchFresh('/');
    const match = body.match(/href="(\/_astro\/[^"]+\.css)"/);
    if (!match) {
      return { name, passed: false, count: 1, detail: 'no /_astro/*.css link found on the homepage' };
    }

    const assetPath = match[1];
    const res = await fetch(`${SITE}${assetPath}`, { cache: 'no-store' });
    const cacheControl = res.headers.get('cache-control') ?? '';
    const maxAgeCount = (cacheControl.match(/max-age=/g) ?? []).length;
    const ok = cacheControl.includes('immutable') && maxAgeCount === 1;

    return {
      name,
      passed: ok,
      count: ok ? 0 : 1,
      detail: `Cache-Control on ${assetPath} is "${cacheControl}" (immutable: ${cacheControl.includes('immutable')}, max-age= appears ${maxAgeCount}x, expected 1)`,
    };
  } catch (err) {
    return { name, passed: false, count: 1, detail: `fetch error: ${(err as Error).message}` };
  }
}

async function checkSampledHrefsTrailingSlash(): Promise<CheckResult> {
  let checked = 0;
  let failed = 0;
  const examples: string[] = [];
  for (const p of SAMPLE_PATHS) {
    try {
      const { body } = await fetchFresh(p);
      const hrefs = [...body.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]);
      for (const href of hrefs) {
        if (!isInternalPageHref(href)) continue;
        checked += 1;
        const cleanPath = href.split('?')[0].split('#')[0];
        if (cleanPath !== '' && !cleanPath.endsWith('/')) {
          failed += 1;
          if (examples.length < 3) examples.push(`${p}: ${href}`);
        }
      }
    } catch (err) {
      failed += 1;
      if (examples.length < 3) examples.push(`${p}: fetch error: ${(err as Error).message}`);
    }
  }
  return {
    name: 'sampled-hrefs-trailing-slash',
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${checked} internal hrefs on sampled pages missing a trailing slash${examples.length ? ` (e.g. ${examples.join('; ')})` : ''}`,
  };
}

function printTable(results: CheckResult[]): void {
  const nameWidth = Math.max(...results.map((r) => r.name.length), 'CHECK'.length);
  const countWidth = Math.max(...results.map((r) => String(r.count).length), 'COUNT'.length);
  const header = `${'CHECK'.padEnd(nameWidth)}  ${'RESULT'.padEnd(6)}  ${'COUNT'.padStart(countWidth)}  DETAIL`;
  console.log(header);
  console.log('-'.repeat(header.length));
  for (const result of results) {
    const label = result.passed ? 'PASS' : 'FAIL';
    console.log(
      `${result.name.padEnd(nameWidth)}  ${label.padEnd(6)}  ${String(result.count).padStart(countWidth)}  ${result.detail}`,
    );
  }
}

async function main(): Promise<void> {
  console.log(`Verifying ${SITE} ...\n`);

  const results: CheckResult[] = [
    await checkCanonicalMatchesUrl(),
    await checkNoindexAbsent(),
    await checkOldUrlRedirects(),
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

  printTable(results);

  const failures = results.filter((r) => !r.passed);
  if (failures.length > 0) {
    console.error(`\n${failures.length} check(s) failed: ${failures.map((r) => r.name).join(', ')}`);
    process.exit(1);
  }

  console.log('\nAll checks passed.');
}

main();
