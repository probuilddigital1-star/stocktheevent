import { test, expect } from '@playwright/test';

test.describe('Calculation Accuracy', () => {
  test('Wings calculation is reasonable for 50 guests', async ({ page }) => {
    await page.goto('/food/wings-for-super-bowl-party-50-guests/');

    // Get the main number displayed (answer-number class in new design)
    const mainNumber = page.locator('.answer-number').first();
    const text = await mainNumber.textContent();
    const number = parseInt(text?.replace(/[^\d]/g, '') || '0');

    // For 50 guests at Super Bowl (high consumption), expect reasonable range
    expect(number).toBeGreaterThan(30);
    expect(number).toBeLessThan(250);
  });

  test('Pizza calculation is reasonable for 30 guests', async ({ page }) => {
    await page.goto('/food/pizza-for-birthday-party-30-guests/');

    const mainNumber = page.locator('.answer-number').first();
    const text = await mainNumber.textContent();
    const number = parseInt(text?.replace(/[^\d]/g, '') || '0');

    // For 30 guests: reasonable pizza range
    expect(number).toBeGreaterThan(5);
    expect(number).toBeLessThan(30);
  });

  test('Beer headline is the full-bar share, with the only-drink figure below', async ({ page }) => {
    await page.goto('/beer-for-birthday-party-50-guests/');

    // The headline is beer's share of a full bar, not the only-drink amount.
    const mainNumber = page.locator('.answer-number').first();
    const text = await mainNumber.textContent();
    const number = parseInt(text?.replace(/[^\d]/g, '') || '0');

    expect(number).toBeGreaterThan(0);
    expect(number).toBeLessThan(40);

    // The only-drink figure is the secondary line, and is always the larger of
    // the two because a full bar splits the same total between four drinks.
    const secondary = page.locator('.answer-only-drink');
    await expect(secondary).toBeVisible();
    await expect(secondary).toContainText('If beer is the only alcohol you serve');

    const figureText = await secondary.locator('.only-drink-figure').textContent();
    const onlyDrink = parseInt(figureText?.replace(/[^\d]/g, '') || '0');
    expect(onlyDrink).toBeGreaterThan(number);
  });

  test('Champagne pages show a toast-only figure', async ({ page }) => {
    await page.goto('/champagne-for-wedding-150-guests/');

    const toastLine = page.locator('.answer-toast');
    await expect(toastLine).toBeVisible();
    await expect(toastLine).toContainText('For a toast only');

    // One flute per guest at 6 flutes per bottle, plus the 15% buffer.
    const text = await toastLine.textContent();
    const bottles = parseInt(text?.match(/(\d+)\s*bottles/)?.[1] || '0');
    expect(bottles).toBe(29);
  });

  test('Bar setup totals match each drink page headline', async ({ page }) => {
    await page.goto('/bar-setup/wedding-100-guests/');
    const barWine = await page
      .locator('.drink-card[data-drink-id="wine"] .drink-units')
      .textContent();

    await page.goto('/wine-for-wedding-100-guests/');
    const pageWine = await page.locator('.answer-number').first().textContent();

    expect(pageWine?.trim()).toBe(barWine?.trim());
  });

  test('Large guest count scales appropriately', async ({ page }) => {
    await page.goto('/food/wings-for-super-bowl-party-200-guests/');

    const mainNumber200 = page.locator('.answer-number').first();
    const text200 = await mainNumber200.textContent();
    const number200 = parseInt(text200?.replace(/[^\d]/g, '') || '0');

    await page.goto('/food/wings-for-super-bowl-party-100-guests/');
    const mainNumber100 = page.locator('.answer-number').first();
    const text100 = await mainNumber100.textContent();
    const number100 = parseInt(text100?.replace(/[^\d]/g, '') || '0');

    // 200 guests should need more than 100 guests
    expect(number200).toBeGreaterThan(number100);
  });

  test('Math breakdown shows all steps', async ({ page }) => {
    await page.goto('/food/pizza-for-wedding-100-guests/');

    // Should show the math ledger section
    const mathSection = page.locator('text=How we got there');
    await expect(mathSection.first()).toBeVisible();

    // Ledger rows carry a math-step class on both drink and food pages.
    const steps = page.locator('.math-step');
    expect(await steps.count()).toBeGreaterThanOrEqual(2);
  });

  test('Per guest servings displayed correctly', async ({ page }) => {
    await page.goto('/food/tacos-for-birthday-party-50-guests/');

    // The context line under the answer carries the per-guest figure
    const perGuest = page.locator('text=/per guest/i');
    await expect(perGuest.first()).toBeVisible();
  });
});
