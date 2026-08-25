/**
 * gsc.ts - Google Search Console housekeeping via the googleapis package.
 *
 * Auth: a service account key file, path read from
 * GOOGLE_APPLICATION_CREDENTIALS. The googleapis GoogleAuth client reads
 * that file itself (Application Default Credentials); this script never
 * opens or logs it.
 *
 * Property: sc-domain:stocktheevent.com if the service account has access
 * to it, otherwise https://www.stocktheevent.com/.
 *
 * "Validate fix" and "Request indexing" are not available through the API
 * and remain dashboard-only actions (documented in README.md).
 *
 * Usage: tsx scripts/ops/gsc.ts <submit-sitemap|export|inspect>
 */

import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';
import { events } from '../../src/data/events';
import { items } from '../../src/data/items';
import { foodItems } from '../../src/data/foodItems';
import { INDEXABLE_GUEST_COUNTS } from '../../src/data/indexing';

const DOMAIN_PROPERTY = 'sc-domain:stocktheevent.com';
const URL_PREFIX_PROPERTY = 'https://www.stocktheevent.com/';
const SITEMAP_URL = 'https://www.stocktheevent.com/sitemap-index.xml';
const REPORTS_DIR = path.join(process.cwd(), 'reports');
const DAILY_INSPECTION_QUOTA = 2000;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function toCsvValue(value: unknown): string {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function writeCsv(filePath: string, headers: string[], rows: unknown[][]): void {
  const lines = [headers.join(','), ...rows.map((r) => r.map(toCsvValue).join(','))];
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`);
  console.log(`Wrote ${filePath} (${rows.length} rows)`);
}

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function isoDateMonthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

async function resolveSiteUrl(webmasters: ReturnType<typeof google.webmasters>): Promise<string> {
  try {
    const { data } = await webmasters.sites.list();
    const entries = data.siteEntry ?? [];
    if (entries.some((e) => e.siteUrl === DOMAIN_PROPERTY)) return DOMAIN_PROPERTY;
    console.log(`${DOMAIN_PROPERTY} is not accessible to this service account; falling back to ${URL_PREFIX_PROPERTY}`);
  } catch (err) {
    console.error(`Could not list Search Console properties (${(err as Error).message}); falling back to ${URL_PREFIX_PROPERTY}`);
  }
  return URL_PREFIX_PROPERTY;
}

async function cmdSubmitSitemap(webmasters: ReturnType<typeof google.webmasters>, siteUrl: string): Promise<void> {
  console.log(`Submitting sitemap ${SITEMAP_URL} for ${siteUrl} ...`);
  await webmasters.sitemaps.submit({ siteUrl, feedpath: SITEMAP_URL });
  const { data } = await webmasters.sitemaps.get({ siteUrl, feedpath: SITEMAP_URL });
  console.log('Submitted. Current sitemap status:', JSON.stringify(data));
}

async function queryAnalytics(
  webmasters: ReturnType<typeof google.webmasters>,
  siteUrl: string,
  dimension: 'query' | 'page' | 'date',
  startDate: string,
  endDate: string,
) {
  const { data } = await webmasters.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate, dimensions: [dimension], rowLimit: 5000 },
  });
  return data.rows ?? [];
}

async function cmdExport(webmasters: ReturnType<typeof google.webmasters>, siteUrl: string): Promise<void> {
  const endDate = isoDateDaysAgo(3); // GSC data has a few days of lag
  const startDate = isoDateMonthsAgo(16);
  console.log(`Exporting search analytics for ${siteUrl} from ${startDate} to ${endDate} ...`);

  const queryRows = await queryAnalytics(webmasters, siteUrl, 'query', startDate, endDate);
  writeCsv(
    path.join(REPORTS_DIR, 'gsc-queries-16m.csv'),
    ['query', 'clicks', 'impressions', 'ctr', 'position'],
    queryRows.map((r) => [r.keys?.[0], r.clicks, r.impressions, r.ctr, r.position]),
  );

  const pageRows = await queryAnalytics(webmasters, siteUrl, 'page', startDate, endDate);
  writeCsv(
    path.join(REPORTS_DIR, 'gsc-pages-16m.csv'),
    ['page', 'clicks', 'impressions', 'ctr', 'position'],
    pageRows.map((r) => [r.keys?.[0], r.clicks, r.impressions, r.ctr, r.position]),
  );

  const dailyRows = await queryAnalytics(webmasters, siteUrl, 'date', startDate, endDate);
  writeCsv(
    path.join(REPORTS_DIR, 'gsc-daily-16m.csv'),
    ['date', 'clicks', 'impressions', 'ctr', 'position'],
    dailyRows.map((r) => [r.keys?.[0], r.clicks, r.impressions, r.ctr, r.position]),
  );
}

/**
 * The site's real navigational hub pages: home, about, the two calculator
 * indexes, and every /calculators/{category}/ page (one per drink item and
 * per event). Adjust this list if a different hub set is intended.
 */
function buildHubUrls(): string[] {
  return [
    '/',
    '/about/',
    '/calculators/',
    '/food/',
    ...items.map((i) => `/calculators/${i.id}/`),
    ...events.map((e) => `/calculators/${e.id}/`),
  ];
}

function sampleCycled<T>(arr: T[], n: number): T[] {
  return Array.from({ length: n }, (_, i) => arr[i % arr.length]);
}

/** 30 calculator URLs: 10 drink, 10 food, 10 bar-setup, cycled across all events and indexable guest counts. */
function buildSampledCalculatorUrls(): string[] {
  const sEvents = sampleCycled(events, 10);
  const sItems = sampleCycled(items, 10);
  const sFoods = sampleCycled(foodItems, 10);
  const sGuests = sampleCycled(INDEXABLE_GUEST_COUNTS, 10);

  const drink = sEvents.map((e, i) => `/${sItems[i].id}-for-${e.slug}-${sGuests[i]}-guests/`);
  const food = sEvents.map((e, i) => `/food/${sFoods[i].id}-for-${e.slug}-${sGuests[i]}-guests/`);
  const bar = sEvents.map((e, i) => `/bar-setup/${e.slug}-${sGuests[i]}-guests/`);
  return [...drink, ...food, ...bar];
}

async function cmdInspect(searchconsole: ReturnType<typeof google.searchconsole>, siteUrl: string): Promise<void> {
  const hubUrls = buildHubUrls();
  const sampledUrls = buildSampledCalculatorUrls();
  const allPaths = [...hubUrls, ...sampledUrls];
  console.log(`Inspecting ${allPaths.length} URLs (${hubUrls.length} hub, ${sampledUrls.length} sampled) ...`);

  const rows: unknown[][] = [];
  const coverageCounts: Record<string, number> = {};

  for (let i = 0; i < allPaths.length; i++) {
    if (i >= DAILY_INSPECTION_QUOTA) {
      console.log('Reached the 2,000/day URL Inspection quota; stopping early.');
      break;
    }
    const inspectionUrl = `https://www.stocktheevent.com${allPaths[i]}`;
    try {
      const { data } = await searchconsole.urlInspection.index.inspect({
        requestBody: { inspectionUrl, siteUrl, languageCode: 'en-US' },
      });
      const r = data.inspectionResult?.indexStatusResult ?? {};
      const coverageState = r.coverageState ?? 'UNKNOWN';
      coverageCounts[coverageState] = (coverageCounts[coverageState] ?? 0) + 1;
      rows.push([inspectionUrl, r.verdict ?? '', coverageState, r.googleCanonical ?? '', r.userCanonical ?? '', r.lastCrawlTime ?? '']);
    } catch (err: any) {
      const status = err?.code ?? err?.response?.status;
      const message: string = err?.errors?.[0]?.reason ?? err?.message ?? String(err);
      if (status === 429 || /rate.?limit|quota/i.test(message)) {
        console.log(`Rate limit hit after ${i} of ${allPaths.length} URLs; stopping early. (${message})`);
        break;
      }
      console.error(`Inspection failed for ${inspectionUrl}: ${message}`);
      rows.push([inspectionUrl, 'ERROR', message, '', '', '']);
    }
  }

  writeCsv(
    path.join(REPORTS_DIR, 'gsc-inspection.csv'),
    ['url', 'verdict', 'coverageState', 'googleCanonical', 'userCanonical', 'lastCrawlTime'],
    rows,
  );

  console.log('\nCoverage state summary:');
  for (const [state, count] of Object.entries(coverageCounts)) {
    console.log(`  ${state}: ${count}`);
  }
}

const SUBCOMMANDS = ['submit-sitemap', 'export', 'inspect'] as const;

async function main(): Promise<void> {
  const credPath = requireEnv('GOOGLE_APPLICATION_CREDENTIALS');
  if (!fs.existsSync(credPath)) {
    console.error(`GOOGLE_APPLICATION_CREDENTIALS points to a file that does not exist: ${credPath}`);
    process.exit(1);
  }

  const sub = process.argv[2] as (typeof SUBCOMMANDS)[number] | undefined;
  if (!sub || !SUBCOMMANDS.includes(sub)) {
    console.error(`Usage: tsx scripts/ops/gsc.ts <${SUBCOMMANDS.join('|')}>`);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/webmasters'] });
  google.options({ auth });
  const webmasters = google.webmasters('v3');
  const searchconsole = google.searchconsole('v1');

  const siteUrl = await resolveSiteUrl(webmasters);
  console.log(`Using Search Console property: ${siteUrl}`);

  if (sub === 'submit-sitemap') await cmdSubmitSitemap(webmasters, siteUrl);
  else if (sub === 'export') await cmdExport(webmasters, siteUrl);
  else if (sub === 'inspect') await cmdInspect(searchconsole, siteUrl);
}

main().catch((err) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
