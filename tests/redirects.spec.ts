import { test, expect } from '@playwright/test';
import { spawn, spawnSync, type ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { items } from '../src/data/items';
import { foodItems } from '../src/data/foodItems';
import { events } from '../src/data/events';
import { guestCounts } from '../src/data/guestCounts';

/**
 * Old per-guest-count URLs must 301 to the single page that replaced them.
 *
 * These run against `wrangler pages dev dist`, which applies dist/_redirects
 * with Cloudflare's own redirect engine, so what passes here is what
 * Cloudflare Pages will do. (The dev server the other specs use ignores
 * _redirects.) Run `npm run build` first.
 */

const DIST = path.join(process.cwd(), 'dist');
const PORT = 8788;
const BASE = `http://127.0.0.1:${PORT}`;
const STATIC_LIMIT = 2000;
const DYNAMIC_LIMIT = 100;

let server: ChildProcess | null = null;

async function waitUntilUp(timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/`, { redirect: 'manual' });
      await res.arrayBuffer();
      if (res.status > 0) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`wrangler pages dev did not start on ${BASE} within ${timeoutMs / 1000}s`);
}

test.beforeAll(async () => {
  test.setTimeout(180_000);
  if (!fs.existsSync(path.join(DIST, '_redirects'))) {
    throw new Error('dist/_redirects not found. Run "npm run build" before the redirect specs.');
  }
  // Reuse a server that is already running (for example one started by hand).
  try {
    const res = await fetch(`${BASE}/`, { redirect: 'manual' });
    await res.arrayBuffer();
    return;
  } catch {
    // start our own
  }
  server = spawn('npx', ['wrangler', 'pages', 'dev', 'dist', '--ip', '127.0.0.1', '--port', String(PORT)], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'ignore',
  });
  await waitUntilUp(150_000);
});

test.afterAll(() => {
  if (!server?.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    server.kill('SIGTERM');
  }
});

interface Hit {
  status: number;
  /** Location as path plus query, or null. */
  location: string | null;
}

async function hit(urlPath: string): Promise<Hit> {
  const res = await fetch(`${BASE}${urlPath}`, { redirect: 'manual' });
  await res.arrayBuffer();
  const raw = res.headers.get('location');
  let location: string | null = null;
  if (raw) {
    const url = new URL(raw, BASE);
    location = `${url.pathname}${url.search}`;
  }
  return { status: res.status, location };
}

/** Run `fn` over `inputs` with bounded concurrency. */
async function mapLimit<T, R>(inputs: T[], limit: number, fn: (input: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(inputs.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < inputs.length) {
        const i = next++;
        out[i] = await fn(inputs[i]);
      }
    }),
  );
  return out;
}

function distHas(urlPath: string): boolean {
  const clean = urlPath.split('?')[0].replace(/^\/|\/$/g, '');
  return fs.existsSync(path.join(DIST, clean, 'index.html')) || fs.existsSync(path.join(DIST, clean));
}

interface OldUrl {
  /** The old path, with a trailing slash. */
  from: string;
  /** The page it must end at, with a trailing slash. */
  to: string;
}

/** Every old drink, food and bar-setup URL for every guest count. */
function allOldUrls(): OldUrl[] {
  const urls: OldUrl[] = [];
  for (const { value } of guestCounts) {
    for (const event of events) {
      for (const item of items) {
        urls.push({ from: `/${item.id}-for-${event.slug}-${value}-guests/`, to: `/${item.id}-for-${event.slug}/` });
      }
      for (const food of foodItems) {
        urls.push({
          from: `/food/${food.id}-for-${event.slug}-${value}-guests/`,
          to: `/food/${food.id}-for-${event.slug}/`,
        });
      }
      urls.push({ from: `/bar-setup/${event.slug}-${value}-guests/`, to: `/bar-setup/${event.slug}/` });
    }
  }
  return urls;
}

test.describe('Old guest-count URLs redirect to the consolidated pages', () => {
  test('rule counts stay inside Cloudflare Pages limits', () => {
    const lines = fs
      .readFileSync(path.join(DIST, '_redirects'), 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l !== '' && !l.startsWith('#'));
    const dynamic = lines.filter((l) => /[*:]/.test(l.split(/\s+/)[0])).length;
    const staticRules = lines.length - dynamic;
    expect(staticRules).toBeLessThanOrEqual(STATIC_LIMIT);
    expect(dynamic).toBeLessThanOrEqual(DYNAMIC_LIMIT);
    // Three rules per guest count: slash, no slash, share image.
    expect(lines.length).toBe(guestCounts.length * 3);
  });

  test('spot check: 24 old URLs across drinks, food and bar setup', async () => {
    const cases: [string, string][] = [
      // Drinks
      ['/wine-for-wedding-100-guests/', '/wine-for-wedding/'],
      ['/beer-for-super-bowl-party-25-guests/', '/beer-for-super-bowl-party/'],
      ['/champagne-for-new-years-eve-party-300-guests/', '/champagne-for-new-years-eve-party/'],
      ['/spirits-for-wedding-shower-10-guests/', '/spirits-for-wedding-shower/'],
      ['/wine-for-wedding-125-guests/', '/wine-for-wedding/'], // -125 must not trip the -25 rule
      ['/beer-for-fourth-of-july-party-250-guests', '/beer-for-fourth-of-july-party/'], // no slash
      ['/champagne-for-holiday-party-75-guests', '/champagne-for-holiday-party/'],
      ['/spirits-for-birthday-party-30-guests/', '/spirits-for-birthday-party/'],
      // Food
      ['/food/pizza-for-birthday-party-50-guests/', '/food/pizza-for-birthday-party/'],
      ['/food/wings-for-super-bowl-party-200-guests/', '/food/wings-for-super-bowl-party/'],
      ['/food/tacos-for-graduation-party-15-guests/', '/food/tacos-for-graduation-party/'],
      ['/food/sliders-for-corporate-event-125-guests/', '/food/sliders-for-corporate-event/'],
      ['/food/appetizers-for-wedding-300-guests/', '/food/appetizers-for-wedding/'],
      ['/food/bbq-for-labor-day-party-40-guests', '/food/bbq-for-labor-day-party/'], // no slash
      ['/food/pizza-for-halloween-party-20-guests/', '/food/pizza-for-halloween-party/'],
      ['/food/wings-for-thanksgiving-150-guests', '/food/wings-for-thanksgiving/'],
      // Bar setup
      ['/bar-setup/wedding-100-guests/', '/bar-setup/wedding/'],
      ['/bar-setup/wedding-shower-125-guests/', '/bar-setup/wedding-shower/'], // longer slug shares a prefix with wedding
      ['/bar-setup/wedding-shower-25-guests/', '/bar-setup/wedding-shower/'],
      ['/bar-setup/super-bowl-party-50-guests/', '/bar-setup/super-bowl-party/'],
      ['/bar-setup/march-madness-party-10-guests', '/bar-setup/march-madness-party/'],
      ['/bar-setup/thanksgiving-250-guests/', '/bar-setup/thanksgiving/'],
      ['/bar-setup/corporate-event-30-guests/', '/bar-setup/corporate-event/'],
      ['/bar-setup/new-years-eve-party-300-guests', '/bar-setup/new-years-eve-party/'],
    ];
    expect(cases.length).toBeGreaterThanOrEqual(20);

    for (const [from, to] of cases) {
      const result = await hit(from);
      expect(result.status, `${from} status`).toBe(301);
      expect(result.location, `${from} Location`).toBe(to);
      expect(distHas(to), `${to} exists in dist`).toBe(true);
      const target = await hit(to);
      expect(target.status, `${to} status`).toBe(200);
    }
  });

  test('query strings carry over and old share images move to the new names', async () => {
    const withQuery = await hit('/wine-for-wedding-100-guests/?utm_source=newsletter');
    expect(withQuery.status).toBe(301);
    expect(withQuery.location).toBe('/wine-for-wedding/?utm_source=newsletter');

    const images: [string, string][] = [
      ['/og/wine-for-wedding-100-guests.png', '/og/wine-for-wedding.png'],
      ['/og/pizza-for-birthday-party-50-guests.png', '/og/pizza-for-birthday-party.png'],
      ['/og/wedding-shower-125-guests.png', '/og/wedding-shower.png'],
    ];
    for (const [from, to] of images) {
      const result = await hit(from);
      expect(result.status, `${from} status`).toBe(301);
      expect(result.location, `${from} Location`).toBe(to);
      expect(fs.existsSync(path.join(DIST, to)), `${to} exists in dist`).toBe(true);
      expect((await hit(to)).status, `${to} status`).toBe(200);
    }
  });

  test('every old drink, food and bar-setup URL, with and without the slash, ends at a page in dist', async () => {
    test.setTimeout(300_000);
    const urls = allOldUrls();
    expect(urls.length).toBe(
      guestCounts.length * events.length * (items.length + foodItems.length + 1),
    );

    const problems: string[] = [];
    await mapLimit(urls, 40, async ({ from, to }) => {
      for (const variant of [from, from.slice(0, -1)]) {
        const result = await hit(variant);
        if (result.status !== 301 || result.location !== to) {
          problems.push(`${variant} -> ${result.status} ${result.location} (expected 301 ${to})`);
        }
      }
      if (!distHas(to)) problems.push(`${from} -> ${to} is not in dist`);
    });
    expect(problems.slice(0, 5), `${problems.length} old URLs misrouted`).toEqual([]);
  });

  test('no current page or share image, with or without the slash, is caught by a rule', async () => {
    test.setTimeout(300_000);
    const pagePaths: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name === 'index.html') {
          const rel = path.relative(DIST, path.dirname(full)).split(path.sep).join('/');
          pagePaths.push(rel === '' ? '/' : `/${rel}/`);
        }
      }
    };
    walk(DIST);
    expect(pagePaths).toContain('/bar-setup/wedding-shower/');

    const problems: string[] = [];
    await mapLimit(pagePaths, 40, async (slashed) => {
      const first = await hit(slashed);
      if (first.status !== 200) problems.push(`${slashed} -> ${first.status} ${first.location}`);
      if (slashed !== '/') {
        const bare = await hit(slashed.slice(0, -1));
        // Cloudflare Pages adds the slash itself with a 308. A rule would be a 301.
        if (bare.status === 301) problems.push(`${slashed.slice(0, -1)} -> 301 ${bare.location}`);
      }
    });

    const ogDir = path.join(DIST, 'og');
    const images = fs.readdirSync(ogDir).filter((f) => f.endsWith('.png')).map((f) => `/og/${f}`);
    await mapLimit(images, 40, async (image) => {
      const result = await hit(image);
      if (result.status !== 200) problems.push(`${image} -> ${result.status} ${result.location}`);
    });

    expect(problems.slice(0, 5), `${problems.length} current URLs hit a rule`).toEqual([]);
  });
});
