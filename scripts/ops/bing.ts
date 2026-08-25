/**
 * bing.ts - Bing Webmaster Tools housekeeping via the JSON API.
 *
 * Reads BING_WEBMASTER_API_KEY from the environment. Never echoes it; the
 * key is only ever placed directly into the request URL, never logged.
 *
 * Bing's sitemap submission method is named SubmitFeed, not SubmitSitemap
 * (there is no "SubmitSitemap" method in the current API).
 *
 * Usage: tsx scripts/ops/bing.ts <submit-sitemap|status>
 */

const BING_API_BASE = 'https://ssl.bing.com/webmaster/api.svc/json';
const SITE_URL = 'https://www.stocktheevent.com/';
const SITEMAP_URL = 'https://www.stocktheevent.com/sitemap-index.xml';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const API_KEY = requireEnv('BING_WEBMASTER_API_KEY');

interface BingResponse {
  ok: boolean;
  status: number;
  json: any;
}

// Never log the constructed url: it carries the API key in the query string.
async function bingRequest(method: string, body?: unknown): Promise<BingResponse> {
  const url = `${BING_API_BASE}/${method}?apikey=${API_KEY}`;
  const res = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // empty body on success is normal for this API
  }
  return { ok: res.ok, status: res.status, json };
}

async function cmdSubmitSitemap(): Promise<void> {
  console.log(`Submitting sitemap ${SITEMAP_URL} for ${SITE_URL} via SubmitFeed ...`);
  const { ok, status, json } = await bingRequest('SubmitFeed', { siteUrl: SITE_URL, feedUrl: SITEMAP_URL });
  if (!ok) {
    console.error(`SubmitFeed failed: HTTP ${status} ${JSON.stringify(json ?? '')}`);
    process.exit(1);
  }
  console.log('Submitted successfully.');
}

async function cmdStatus(): Promise<void> {
  console.log('Fetching verified sites (GetUserSites) ...');
  const { ok, status, json } = await bingRequest('GetUserSites');
  if (!ok) {
    console.error(`GetUserSites failed: HTTP ${status} ${JSON.stringify(json ?? '')}`);
    process.exit(1);
  }
  const sites = json?.d ?? [];
  console.log(`${sites.length} site(s) registered to this API key:`);
  for (const site of sites) {
    console.log(`  ${site.Url} (verified: ${site.IsVerified})`);
  }
}

const SUBCOMMANDS: Record<string, () => Promise<void>> = {
  'submit-sitemap': cmdSubmitSitemap,
  status: cmdStatus,
};

async function main(): Promise<void> {
  const sub = process.argv[2];
  const fn = sub ? SUBCOMMANDS[sub] : undefined;
  if (!fn) {
    console.error(`Usage: tsx scripts/ops/bing.ts <${Object.keys(SUBCOMMANDS).join('|')}>`);
    process.exit(1);
  }
  await fn();
}

main().catch((err) => {
  console.error('Unexpected error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
