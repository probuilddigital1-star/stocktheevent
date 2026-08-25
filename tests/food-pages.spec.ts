import { test, expect } from '@playwright/test';

test.describe('Food Calculator Pages', () => {
  test('Super Bowl wings page renders correctly', async ({ page }) => {
    await page.goto('/food/wings-for-super-bowl-party-50-guests/');

    // Check page loads
    await expect(page).toHaveTitle(/Wings.*Super Bowl/i);

    // Check main answer is displayed
    await expect(page.locator('.answer-number').first()).toBeVisible();

    // The Adjust box links to the other foods at this event
    await expect(
      page.locator('a[href="/food/pizza-for-super-bowl-party-50-guests/"]').first(),
    ).toBeVisible();

    // Check math ledger section
    await expect(page.locator('text=How we got there').first()).toBeVisible();

    // Check shopping list exists
    await expect(page.locator('text=Shopping list').first()).toBeVisible();
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

  test('Other-food links work', async ({ page }) => {
    await page.goto('/food/pizza-for-wedding-100-guests/');

    const wingsLink = page.locator('a[href="/food/wings-for-wedding-100-guests/"]').first();
    await expect(wingsLink).toBeVisible();
  });

  test('Cross-links to drink calculators exist', async ({ page }) => {
    await page.goto('/food/tacos-for-graduation-party-50-guests/');

    const drinkLinks = page.locator('a[href*="-for-graduation-party-50-guests/"]:not([href*="/food/"])');
    expect(await drinkLinks.count()).toBeGreaterThan(0);
  });

  test('All food types have pages', async ({ page }) => {
    const foodTypes = ['pizza', 'wings', 'tacos', 'sliders', 'appetizers', 'bbq'];

    for (const food of foodTypes) {
      const response = await page.goto(`/food/${food}-for-birthday-party-50-guests/`);
      expect(response?.status()).toBe(200);
    }
  });

  test('Guest stepper recalculates the answer live', async ({ page }) => {
    await page.goto('/food/pizza-for-wedding-100-guests/');
    await page.waitForLoadState('networkidle');

    const before = parseInt(
      (await page.locator('.answer-number').first().textContent()) || '0',
    );

    await page.fill('#adjust-guests', '200');
    await page.dispatchEvent('#adjust-guests', 'change');
    await page.waitForTimeout(100);

    const after = parseInt(
      (await page.locator('.answer-number').first().textContent()) || '0',
    );
    expect(after).toBeGreaterThan(before);

    // The URL mirrors the adjusted state
    expect(page.url()).toContain('guests=200');
  });
});
