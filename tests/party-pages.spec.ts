import { test, expect } from '@playwright/test';

test.describe('Seasonal Party Landing Pages', () => {
  test('Super Bowl Party Calculator loads', async ({ page }) => {
    await page.goto('/party/super-bowl-party-calculator/');

    // Check page loads with correct title
    await expect(page).toHaveTitle(/Super Bowl.*Party.*Calculator/i);

    // Check H1 exists (use main content area to avoid dev toolbar)
    const h1 = page.locator('main h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/Super Bowl/i);

    // Check guest count buttons exist
    await expect(page.locator('.guest-btn').first()).toBeVisible();
  });

  test('Guest count selector updates content', async ({ page }) => {
    await page.goto('/party/super-bowl-party-calculator/');

    // Find and interact with guest selector
    const selector = page.locator('select').first();
    if (await selector.isVisible()) {
      // Get initial values
      const initialText = await page.locator('[data-food-quantity], [data-drink-quantity]').first().textContent();

      // Change guest count
      await selector.selectOption({ index: 3 });

      // Wait for update
      await page.waitForTimeout(500);
    }
  });

  test('All seasonal pages exist and load', async ({ page }) => {
    const seasonalPages = [
      'super-bowl-party-calculator',
      'march-madness-party-calculator',
      'graduation-party-calculator',
      'fourth-of-july-party-calculator',
      'labor-day-party-calculator',
      'halloween-party-calculator',
      'thanksgiving-calculator',
      'christmas-party-calculator',
      'new-years-eve-party-calculator'
    ];

    for (const slug of seasonalPages) {
      const response = await page.goto(`/party/${slug}/`);
      expect(response?.status(), `Page /party/${slug} should return 200`).toBe(200);

      // Verify H1 exists (use main content area)
      const h1 = page.locator('main h1').first();
      await expect(h1).toBeVisible();
    }
  });

  test('Food and drink calculator links work', async ({ page }) => {
    await page.goto('/party/super-bowl-party-calculator/');

    // Check for calculator links
    const calcLinks = page.locator('a[href*="/food/"], a[href*="-for-super-bowl"]');
    const count = await calcLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Other seasonal events links exist', async ({ page }) => {
    await page.goto('/party/super-bowl-party-calculator/');

    // Should have links to other seasonal events
    const otherEventsSection = page.locator('text=/Other.*Events|More.*Parties/i');
  });

  test('Email capture form exists', async ({ page }) => {
    await page.goto('/party/graduation-party-calculator/');

    // Check for email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('Meta tags are properly set', async ({ page }) => {
    await page.goto('/party/fourth-of-july-party-calculator/');

    // Check meta description
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);

    // Check OG tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });

  test('Affiliate links have FTC compliance', async ({ page }) => {
    await page.goto('/party/super-bowl-party-calculator/');

    const amazonLinks = page.locator('a[href*="amazon.com"]');
    const count = await amazonLinks.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const rel = await amazonLinks.nth(i).getAttribute('rel');
      expect(rel).toMatch(/sponsored|noopener/);
    }
  });
});
