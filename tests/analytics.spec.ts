import { test, expect } from '@playwright/test';
import * as zlib from 'zlib';

// PUBLIC_POSTHOG_KEY is read at build time and baked into the bundle, so a
// single running server can't be given "the key unset" for one test. This
// blocks the same network paths PostHog needs (its own npm chunk and its
// ingestion host), which leaves window.posthog undefined exactly as it
// would be with the key unset, an ad blocker, or a network failure - the
// exact condition track() must tolerate.
test.describe('Analytics degrade safely when PostHog is unavailable', () => {
  test('homepage loads with no console errors and track() stays a no-op', async ({ page }) => {
    // "Failed to load resource" is Chromium's own notice for the requests
    // this test deliberately aborts below, not an application error.
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    // Broad enough to catch the module wherever Vite serves it from (a
    // node_modules/.vite/deps path in dev, a hashed chunk in a prod build)
    // as well as PostHog's own ingestion host.
    await page.route('**posthog**', (route) => route.abort());

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const posthogPresent = await page.evaluate(() => typeof window.posthog !== 'undefined');
    expect(posthogPresent).toBe(false);

    // Exercises the same delegated click-tracking path BaseLayout wires up,
    // through a real affiliate link on the homepage-adjacent calculator
    // flow, to confirm a click with PostHog absent does not throw either.
    await page.evaluate(() => {
      const link = document.createElement('a');
      link.href = 'https://www.amazon.com/dp/EXAMPLE';
      link.setAttribute('data-affiliate', 'test-key');
      link.textContent = 'test link';
      link.addEventListener('click', (e) => e.preventDefault());
      document.body.appendChild(link);
      link.click();
      link.remove();
    });

    expect(consoleErrors).toEqual([]);
  });
});

// PUBLIC_POSTHOG_KEY is set in .env for this project, so the running dev
// server already has PostHog enabled - no per-test env override needed.
//
// posthog-js refuses to capture anything for a browser it thinks is a bot,
// and Chromium under Playwright reports a "HeadlessChrome" UA-CH brand
// (navigator.userAgentData.brands) even when navigator.webdriver is spoofed
// away - "headlesschrome" is on posthog-js's built-in blocklist. Both
// signals are neutralized here so the capture call under test actually
// fires, the same way it would for a real visitor.
test.describe('PostHog pageview capture', () => {
  test('homepage load sends a $pageview tagged with the site property', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false, configurable: true });
      const cleanBrands = [
        { brand: 'Chromium', version: '143' },
        { brand: 'Not:A-Brand', version: '99' },
        { brand: 'Google Chrome', version: '143' },
      ];
      Object.defineProperty(Navigator.prototype, 'userAgentData', {
        get: () => ({ brands: cleanBrands, mobile: false, platform: 'Windows' }),
        configurable: true,
      });
    });

    await page.route('https://us.i.posthog.com/**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":1}' });
    });

    // posthog-js's capture endpoint is /e/ on the configured api_host, sent
    // gzip-compressed regardless of Content-Type, so the body needs
    // decompressing before it can be checked for content.
    const capturePromise = page.waitForRequest(
      (request) => request.url() === 'https://us.i.posthog.com/e/',
    );

    await page.goto('/');

    const captureRequest = await capturePromise;
    const buffer = captureRequest.postDataBuffer();
    expect(buffer).not.toBeNull();
    const body = zlib.gunzipSync(buffer!).toString('utf-8');

    expect(body).toContain('$pageview');
    expect(body).toContain('stocktheevent');
  });
});
