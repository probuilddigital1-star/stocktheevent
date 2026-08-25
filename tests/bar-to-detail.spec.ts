import { test, expect } from '@playwright/test';

test.describe('Bar Setup to Detail Page Flow', () => {
  test('Detail links show correct units from bar-setup', async ({ page }) => {
    // Go to a bar-setup page
    await page.goto('/bar-setup/graduation-party-100-guests/?drinks=wine,beer,champagne,spirits');
    await page.waitForLoadState('networkidle');

    // Get the wine units displayed on the bar-setup page
    const wineCard = page.locator('.drink-card[data-drink-id="wine"]');
    const wineUnits = await wineCard.locator('.drink-units').textContent();

    // Get the wine detail link
    const wineDetailLink = page.locator('.detail-link[data-drink-id="wine"]');

    // Verify the detail link shows the same units
    const linkUnitsText = await wineDetailLink.locator('.detail-units').textContent();
    expect(linkUnitsText).toContain(wineUnits ?? '');
  });

  test('Drink page headline matches the bar-setup card', async ({ page }) => {
    // The bar-setup card and the drink page's own headline both show the
    // drink's share of a full bar, so they must agree.
    await page.goto('/bar-setup/graduation-party-100-guests/');
    await page.waitForLoadState('networkidle');

    const wineCard = page.locator('.drink-card[data-drink-id="wine"]');
    const barUnits = (await wineCard.locator('.drink-units').textContent())?.trim();

    await page.goto('/wine-for-graduation-party-100-guests/');
    await page.waitForLoadState('networkidle');

    const headline = (await page.locator('.answer-number').first().textContent())?.trim();
    expect(headline).toBe(barUnits);
  });

  test('Full flow: bar-setup card to matching drink page', async ({ page }) => {
    await page.goto('/bar-setup/wedding-100-guests/?drinks=wine,beer,champagne,spirits');
    await page.waitForLoadState('networkidle');

    const wineCard = page.locator('.drink-card[data-drink-id="wine"]');
    const originalWineUnits = (await wineCard.locator('.drink-units').textContent())?.trim();

    // Click on wine detail link
    await page.locator('.detail-link[data-drink-id="wine"]').click();
    await page.waitForLoadState('networkidle');

    // Verify we're on the detail page and the headline agrees
    expect(page.url()).toContain('wine-for-wedding');
    const headline = (await page.locator('.answer-number').first().textContent())?.trim();
    expect(headline).toBe(originalWineUnits);
  });

  test('Adjust steppers recalculate the drink page live', async ({ page }) => {
    await page.goto('/wine-for-wedding-100-guests/');
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

    // URL mirrors the adjusted state; the H1 follows the guest count
    expect(page.url()).toContain('guests=200');
    await expect(page.locator('main h1').first()).toContainText('200');
  });

  test('URL parameters restore an adjusted state on load', async ({ page }) => {
    await page.goto('/wine-for-wedding-100-guests/');
    await page.waitForLoadState('networkidle');
    const base = parseInt(
      (await page.locator('.answer-number').first().textContent()) || '0',
    );

    await page.goto('/wine-for-wedding-100-guests/?guests=200');
    await page.waitForLoadState('networkidle');
    const adjusted = parseInt(
      (await page.locator('.answer-number').first().textContent()) || '0',
    );

    expect(adjusted).toBeGreaterThan(base);
    await expect(page.locator('#adjust-guests')).toHaveValue('200');
  });
});
