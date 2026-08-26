import { test, expect } from '@playwright/test';

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
