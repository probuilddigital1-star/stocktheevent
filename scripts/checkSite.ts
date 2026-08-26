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

const CHECKS_ENFORCED: string[] = [
  'canonical-format',
  'internal-href-trailing-slash',
  'sitemap-noindex-guest-pages',
  'no-google-fonts',
  'no-emoji',
  'single-h1',
  'no-em-dash',
];

const SITE_ORIGIN = 'https://www.stocktheevent.com';
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
    passed: true,
    count: sitemapUrls.length,
    detail: `${sitemapUrls.length} URLs in the sitemap`,
  };
}

function checkSitemapNoindexGuestPages(sitemapUrls: string[]): CheckResult {
  const guestPageUrls = sitemapUrls.filter((url) => /-\d+-guests?(\/|$)/.test(url));
  let failed = 0;
  const examples: string[] = [];
  for (const url of guestPageUrls) {
    const urlPath = url.replace(SITE_ORIGIN, '');
    const filePath = urlPathToDistFile(urlPath);
    if (!fs.existsSync(filePath)) continue;
    const html = fs.readFileSync(filePath, 'utf8');
    if (/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(html)) {
      failed += 1;
      if (examples.length < 3) examples.push(url);
    }
  }
  return {
    name: 'sitemap-noindex-guest-pages',
    passed: failed === 0,
    count: failed,
    detail: `${failed} of ${guestPageUrls.length} guest-count sitemap URLs are noindexed${examples.length ? ` (e.g. ${examples.join(', ')})` : ''}`,
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

  const results: CheckResult[] = [
    checkCanonicalFormat(htmlFiles),
    checkTrailingSlashes(htmlFiles),
    checkSitemapCount(sitemapUrls),
    checkSitemapNoindexGuestPages(sitemapUrls),
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
