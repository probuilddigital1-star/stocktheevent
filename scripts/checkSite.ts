/**
 * checkSite.ts - inspects a built dist/ and reports rule compliance.
 *
 * Run after `npm run build`: `npm run check`.
 *
 * Checks are informational by default. Only names listed in
 * CHECKS_ENFORCED cause a non-zero exit. Add a check's name here once its
 * underlying issue is fixed and it should start blocking the build.
 */

import * as fs from 'fs';
import * as path from 'path';
import { items } from '../src/data/items';
import { foodItems } from '../src/data/foodItems';
import { events } from '../src/data/events';
import { guestCounts } from '../src/data/guestCounts';
import { redirectRules } from '../src/lib/redirects';

const CHECKS_ENFORCED: string[] = [
  'canonical-format',
  'internal-href-trailing-slash',
  'sitemap-url-count',
  'sitemap-no-noindex',
  'redirect-rules',
  'no-page-matches-redirect',
  'old-urls-redirect-to-pages',
  'no-google-fonts',
  'no-emoji',
  'single-h1',
  'no-em-dash',
];

const SITE_ORIGIN = 'https://www.stocktheevent.com';
/** The consolidation target: fewer than 200 URLs in the sitemap. */
const SITEMAP_URL_LIMIT = 200;
/** Cloudflare Pages caps on _redirects. */
const STATIC_REDIRECT_LIMIT = 2000;
const DYNAMIC_REDIRECT_LIMIT = 100;
const DIST_DIR = path.join(process.cwd(), 'dist');
const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;

interface CheckResult {
  name: string;
  passed: boolean;
  count: number;
  detail: string;
}

function walk(dir: string, predicate: (file: string) => boolean, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, predicate, out);
    } else if (predicate(full)) {
      out.push(full);
    }
  }
  return out;
}

function stripNonText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
}

function urlPathToDistFile(urlPath: string): string {
  const cleanPath = urlPath.split('?')[0].split('#')[0];
  if (cleanPath === '/' || cleanPath === '') {
    return path.join(DIST_DIR, 'index.html');
  }
  if (cleanPath.endsWith('/')) {
    return path.join(DIST_DIR, cleanPath, 'index.html');
  }
  return path.join(DIST_DIR, `${cleanPath}.html`);
}

function readSitemapUrls(): string[] {
  const indexPath = path.join(DIST_DIR, 'sitemap-index.xml');
  const singlePath = path.join(DIST_DIR, 'sitemap.xml');

  let shardPaths: string[] = [];

  if (fs.existsSync(indexPath)) {
    const indexXml = fs.readFileSync(indexPath, 'utf8');
    const shardUrls = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    shardPaths = shardUrls.map((shardUrl) => {
      const fileName = shardUrl.replace(SITE_ORIGIN, '').replace(/^\//, '');
      return path.join(DIST_DIR, fileName);
    });
  } else if (fs.existsSync(singlePath)) {
    shardPaths = [singlePath];
  }

  const urls: string[] = [];
  for (const shardPath of shardPaths) {
    if (!fs.existsSync(shardPath)) continue;
    const shardXml = fs.readFileSync(shardPath, 'utf8');
    urls.push(...[...shardXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  }
  return urls;
}

function checkCanonicalFormat(htmlFiles: string[]): CheckResult {
  let failed = 0;
  const examples: string[] = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const match = html.match(/<link rel="canonical" href="([^"]+)"/);
    const href = match?.[1];
    const isValid = !!href && href.startsWith(`${SITE_ORIGIN}/`) && href.endsWith('/');
    if (!isValid) {
      failed += 1;
      if (examples.length < 3) examples.push(path.relative(DIST_DIR, file));
    }
  }
  return {
    name: 'canonical-format',
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${htmlFiles.length} pages missing a canonical tag or with a malformed canonical URL${examples.length ? ` (e.g. ${examples.join(', ')})` : ''}`,
  };
}

function isInternalPageHref(href: string): boolean {
  if (!href.startsWith('/') || href.startsWith('//')) return false;
  const cleanPath = href.split('?')[0].split('#')[0];
  const lastSegment = cleanPath.split('/').pop() ?? '';
  if (lastSegment.includes('.')) return false; // asset file, not a page route
  return true;
}

function checkTrailingSlashes(htmlFiles: string[]): CheckResult {
  let checked = 0;
  let failed = 0;
  const examples: string[] = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const hrefs = [...html.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]);
    for (const href of hrefs) {
      if (!isInternalPageHref(href)) continue;
      checked += 1;
      const cleanPath = href.split('?')[0].split('#')[0];
      if (cleanPath !== '' && !cleanPath.endsWith('/')) {
        failed += 1;
        if (examples.length < 3) examples.push(href);
      }
    }
  }
  return {
    name: 'internal-href-trailing-slash',
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${checked} internal <a> hrefs missing a trailing slash${examples.length ? ` (e.g. ${examples.join(', ')})` : ''}`,
  };
}

function checkSitemapCount(sitemapUrls: string[]): CheckResult {
  return {
    name: 'sitemap-url-count',
    passed: sitemapUrls.length < SITEMAP_URL_LIMIT,
    count: sitemapUrls.length,
    detail: `${sitemapUrls.length} URLs in the sitemap (limit ${SITEMAP_URL_LIMIT - 1})`,
  };
}

function checkSitemapNoNoindex(sitemapUrls: string[]): CheckResult {
  let failed = 0;
  const examples: string[] = [];
  for (const url of sitemapUrls) {
    const filePath = urlPathToDistFile(url.replace(SITE_ORIGIN, ''));
    if (!fs.existsSync(filePath)) continue;
    const html = fs.readFileSync(filePath, 'utf8');
    if (/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html)) {
      failed += 1;
      if (examples.length < 3) examples.push(url);
    }
  }
  return {
    name: 'sitemap-no-noindex',
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${sitemapUrls.length} sitemap URLs are noindexed${examples.length ? ` (e.g. ${examples.join(', ')})` : ''}`,
  };
}

// -----------------------------------------------------------------------------
// Redirect rules (dist/_redirects)
//
// The authoritative test of the redirects is tests/redirects.spec.ts, which
// runs them through Cloudflare's own engine (wrangler pages dev). These checks
// are the fast structural half: the rule file is the expected one, it is
// inside Cloudflare's limits, and the three rule shapes it contains (one `*`
// splat each) resolve every old URL to a file that exists in dist.
// -----------------------------------------------------------------------------

interface RedirectRule {
  from: string;
  to: string;
  status: number;
}

function readRedirectRules(): RedirectRule[] | null {
  const file = path.join(DIST_DIR, '_redirects');
  if (!fs.existsSync(file)) return null;
  return fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status: Number(status ?? 302) };
    });
}

/** Match a path against a `*` splat rule; returns the splat, or null. */
function matchRule(rule: RedirectRule, urlPath: string): string | null {
  const star = rule.from.indexOf('*');
  if (star === -1) return rule.from === urlPath ? '' : null;
  const prefix = rule.from.slice(0, star);
  const suffix = rule.from.slice(star + 1);
  if (urlPath.length < prefix.length + suffix.length) return null;
  if (!urlPath.startsWith(prefix) || !urlPath.endsWith(suffix)) return null;
  return urlPath.slice(prefix.length, urlPath.length - suffix.length);
}

function destination(rule: RedirectRule, splat: string): string {
  return rule.to.replace(':splat', splat);
}

function checkRedirectRules(rules: RedirectRule[] | null): CheckResult {
  if (!rules) {
    return { name: 'redirect-rules', passed: false, count: 0, detail: 'dist/_redirects is missing' };
  }
  const isDynamic = (r: RedirectRule) => /[*:]/.test(r.from);
  const dynamic = rules.filter(isDynamic).length;
  const staticCount = rules.length - dynamic;
  const expected = redirectRules().map((line) => line.split(' ').slice(0, 2).join(' '));
  const actual = rules.map((r) => `${r.from} ${r.to}`);
  const sameSet = expected.length === actual.length && expected.every((line, i) => line === actual[i]);
  const allPermanent = rules.every((r) => r.status === 301);
  const passed = sameSet && allPermanent && staticCount <= STATIC_REDIRECT_LIMIT && dynamic <= DYNAMIC_REDIRECT_LIMIT;
  return {
    name: 'redirect-rules',
    passed,
    count: rules.length,
    detail: `${staticCount} static (limit ${STATIC_REDIRECT_LIMIT}), ${dynamic} dynamic (limit ${DYNAMIC_REDIRECT_LIMIT}); ${sameSet ? 'matches the generated rule set' : 'DIFFERS from the generated rule set'}; ${allPermanent ? 'all 301' : 'not all 301'}`,
  };
}

function checkNoPageMatchesRedirect(rules: RedirectRule[] | null, htmlFiles: string[]): CheckResult {
  if (!rules) return { name: 'no-page-matches-redirect', passed: false, count: 0, detail: 'dist/_redirects is missing' };
  const urlPaths: string[] = [];
  for (const file of htmlFiles) {
    const rel = '/' + path.relative(DIST_DIR, file).split(path.sep).join('/');
    if (rel.endsWith('/index.html')) {
      const withSlash = rel.slice(0, -'index.html'.length);
      urlPaths.push(withSlash, withSlash.replace(/\/$/, '') || '/');
    } else {
      urlPaths.push(rel);
    }
  }
  const ogDir = path.join(DIST_DIR, 'og');
  if (fs.existsSync(ogDir)) {
    for (const file of walk(ogDir, (f) => f.endsWith('.png'))) {
      urlPaths.push('/' + path.relative(DIST_DIR, file).split(path.sep).join('/'));
    }
  }
  const examples: string[] = [];
  let failed = 0;
  for (const urlPath of urlPaths) {
    if (rules.some((rule) => matchRule(rule, urlPath) !== null)) {
      failed += 1;
      if (examples.length < 3) examples.push(urlPath);
    }
  }
  return {
    name: 'no-page-matches-redirect',
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${urlPaths.length} pages and share images (with and without slash) match a redirect rule${examples.length ? ` (e.g. ${examples.join(', ')})` : ''}`,
  };
}

function checkOldUrlsRedirectToPages(rules: RedirectRule[] | null): CheckResult {
  if (!rules) return { name: 'old-urls-redirect-to-pages', passed: false, count: 0, detail: 'dist/_redirects is missing' };

  // Each old page URL (no trailing slash) and the share image name it had.
  const oldPages: { page: string; image: string }[] = [];
  for (const { value } of guestCounts) {
    for (const event of events) {
      for (const item of items) {
        const name = `${item.id}-for-${event.slug}-${value}-guests`;
        oldPages.push({ page: `/${name}`, image: `/og/${name}.png` });
      }
      for (const food of foodItems) {
        const name = `${food.id}-for-${event.slug}-${value}-guests`;
        oldPages.push({ page: `/food/${name}`, image: `/og/${name}.png` });
      }
      const bar = `${event.slug}-${value}-guests`;
      oldPages.push({ page: `/bar-setup/${bar}`, image: `/og/${bar}.png` });
    }
  }

  let checked = 0;
  let failed = 0;
  const examples: string[] = [];
  const check = (oldUrl: string, toFile: (dest: string) => string) => {
    checked += 1;
    const rule = rules.find((r) => matchRule(r, oldUrl) !== null);
    const dest = rule ? destination(rule, matchRule(rule, oldUrl)!) : null;
    if (!dest || !fs.existsSync(toFile(dest))) {
      failed += 1;
      if (examples.length < 3) examples.push(`${oldUrl} -> ${dest ?? 'no rule'}`);
    }
  };
  for (const { page, image } of oldPages) {
    check(`${page}/`, urlPathToDistFile);
    check(page, urlPathToDistFile);
    check(image, (dest) => path.join(DIST_DIR, dest));
  }
  return {
    name: 'old-urls-redirect-to-pages',
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${checked} old drink, food and bar-setup URLs (with and without slash, plus share images) do not end at a file in dist${examples.length ? ` (e.g. ${examples.join(', ')})` : ''}`,
  };
}

function checkSingleH1(htmlFiles: string[]): CheckResult {
  let failed = 0;
  const examples: string[] = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const h1Count = (html.match(/<h1(?=[\s>])/gi) ?? []).length;
    if (h1Count !== 1) {
      failed += 1;
      if (examples.length < 3) examples.push(`${path.relative(DIST_DIR, file)} (${h1Count})`);
    }
  }
  return {
    name: 'single-h1',
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${htmlFiles.length} pages without exactly one <h1>${examples.length ? ` (e.g. ${examples.join(', ')})` : ''}`,
  };
}

function checkNoGoogleFonts(textFiles: string[]): CheckResult {
  let failed = 0;
  for (const file of textFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('fonts.googleapis.com') || content.includes('fonts.gstatic.com')) {
      failed += 1;
    }
  }
  return {
    name: 'no-google-fonts',
    passed: failed === 0,
    count: failed,
    detail: `${failed} files reference fonts.googleapis.com or fonts.gstatic.com`,
  };
}

function checkNoEmoji(htmlFiles: string[]): CheckResult {
  let failed = 0;
  for (const file of htmlFiles) {
    const html = stripNonText(fs.readFileSync(file, 'utf8'));
    EMOJI_RE.lastIndex = 0;
    if (EMOJI_RE.test(html)) {
      failed += 1;
    }
  }
  return {
    name: 'no-emoji',
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${htmlFiles.length} pages contain emoji code points`,
  };
}

function checkNoEmDash(htmlFiles: string[]): CheckResult {
  let failed = 0;
  const examples: string[] = [];
  for (const file of htmlFiles) {
    const html = stripNonText(fs.readFileSync(file, 'utf8'));
    if (html.includes('—')) {
      failed += 1;
      if (examples.length < 3) examples.push(path.relative(DIST_DIR, file));
    }
  }
  return {
    name: 'no-em-dash',
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${htmlFiles.length} pages contain an em dash in text${examples.length ? ` (e.g. ${examples.join(', ')})` : ''}`,
  };
}

function checkNoAdMarkupWhenNetworkNone(htmlFiles: string[]): CheckResult {
  // Looks for an actual rendered ad unit or the AdSense loader script, not
  // just the word "adsbygoogle" - AdSlot.astro's own scoped CSS can contain
  // that class name in an unused selector even when nothing renders.
  const AD_MARKUP_RE = /<ins\s+class="adsbygoogle"|googlesyndication\.com/;
  let count = 0;
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    if (AD_MARKUP_RE.test(html)) count += 1;
  }
  return {
    name: 'no-ad-markup-when-network-none',
    passed: count === 0,
    count,
    detail: `${count} of ${htmlFiles.length} pages contain a rendered AdSense unit or loader script (expected 0 when PUBLIC_AD_NETWORK is "none")`,
  };
}

function checkFontBytes(): CheckResult {
  if (!fs.existsSync(FONTS_DIR)) {
    return {
      name: 'fonts-bytes',
      passed: true,
      count: 0,
      detail: 'public/fonts does not exist yet',
    };
  }
  const fontFiles = walk(FONTS_DIR, () => true);
  const totalBytes = fontFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
  return {
    name: 'fonts-bytes',
    passed: true,
    count: totalBytes,
    detail: `${totalBytes} bytes across ${fontFiles.length} files in public/fonts`,
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

function main(): void {
  if (!fs.existsSync(DIST_DIR)) {
    console.error('dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }

  const htmlFiles = walk(DIST_DIR, (file) => file.endsWith('.html'));
  const textFiles = walk(DIST_DIR, (file) => /\.(html|css|js|xml|txt|svg)$/.test(file));
  const sitemapUrls = readSitemapUrls();
  const redirectRulesInDist = readRedirectRules();

  const results: CheckResult[] = [
    checkCanonicalFormat(htmlFiles),
    checkTrailingSlashes(htmlFiles),
    checkSitemapCount(sitemapUrls),
    checkSitemapNoNoindex(sitemapUrls),
    checkRedirectRules(redirectRulesInDist),
    checkNoPageMatchesRedirect(redirectRulesInDist, htmlFiles),
    checkOldUrlsRedirectToPages(redirectRulesInDist),
    checkSingleH1(htmlFiles),
    checkNoGoogleFonts(textFiles),
    checkNoEmoji(htmlFiles),
    checkNoEmDash(htmlFiles),
    checkNoAdMarkupWhenNetworkNone(htmlFiles),
    checkFontBytes(),
  ];

  printTable(results);

  const enforcedFailures = results.filter((r) => CHECKS_ENFORCED.includes(r.name) && !r.passed);
  if (enforcedFailures.length > 0) {
    console.error(`\n${enforcedFailures.length} enforced check(s) failed: ${enforcedFailures.map((r) => r.name).join(', ')}`);
    process.exit(1);
  }
}

main();
