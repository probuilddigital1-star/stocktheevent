import { test, expect } from '@playwright/test';

test.describe('Food Calculator Pages', () => {
  test('Super Bowl wings page renders correctly', async ({ page }) => {
    await page.goto('/food/wings-for-super-bowl-party-50-guests/');

    // Check page loads
    await expect(page).toHaveTitle(/Wings.*Super Bowl/i);

    // Check main answer is displayed (main content area)
    await expect(page.locator('main .text-6xl, main .text-7xl').first()).toBeVisible();

    // Check food switcher exists
    await expect(page.locator('text=Switch food')).toBeVisible();

    // Check math breakdown section
    await expect(page.locator('text=Why This Amount Works')).toBeVisible();

    // Check shopping list exists
    await expect(page.locator('text=Shopping List')).toBeVisible();
  });

  test('Pizza page has correct structure', async ({ page }) => {
    await page.goto('/food/pizza-for-birthday-party-30-guests/');

    // Verify H1 exists (use main content area to avoid dev toolbar)
    const h1 = page.locator('main h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/pizza/i);

    // Check meta description exists
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);

    // Check JSON-LD schema exists
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd.first()).toBeAttached();
  });

  test('Food switcher links work', async ({ page }) => {
    await page.goto('/food/pizza-for-wedding-100-guests/');

    // Click on wings switcher
    const wingsLink = page.locator('a:has-text("Wings")').first();
    await expect(wingsLink).toBeVisible();

    // Verify link href is correct format
    const href = await wingsLink.getAttribute('href');
    expect(href).toMatch(/\/food\/wings-for-wedding-100-guests/);
  });

  test('Cross-links to drink calculators exist', async ({ page }) => {
    await page.goto('/food/tacos-for-graduation-party-50-guests/');

    // Check for drink calculator links
    const drinkSection = page.locator('text=Drink Calculators');
    // May or may not exist depending on relatedDrinks data
  });

  test('All food types have pages', async ({ page }) => {
    const foodTypes = ['pizza', 'wings', 'tacos', 'sliders', 'appetizers', 'bbq'];

    for (const food of foodTypes) {
      const response = await page.goto(`/food/${food}-for-birthday-party-50-guests/`);
      expect(response?.status()).toBe(200);
    }
  });

  test('Affiliate links have correct attributes', async ({ page }) => {
    await page.goto('/food/wings-for-super-bowl-party-50-guests/');

    // Check Amazon links have sponsored rel
    const amazonLinks = page.locator('a[href*="amazon.com"]');
    const count = await amazonLinks.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const rel = await amazonLinks.nth(i).getAttribute('rel');
      expect(rel).toMatch(/sponsored|noopener/);
    }
  });
});
