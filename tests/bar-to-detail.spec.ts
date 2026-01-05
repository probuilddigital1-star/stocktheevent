import { test, expect } from '@playwright/test';

test.describe('Bar Setup to Detail Page Flow', () => {
  test('Detail links show correct units from bar-setup', async ({ page }) => {
    // Go to a bar-setup page
    await page.goto('/bar-setup/graduation-party-100-guests?drinks=wine,beer,champagne,spirits');
    await page.waitForLoadState('networkidle');

    // Get the wine units displayed on the bar-setup page
    const wineCard = page.locator('.drink-card[data-drink-id="wine"]');
    const wineUnits = await wineCard.locator('.drink-units').textContent();

    // Get the wine detail link
    const wineDetailLink = page.locator('.detail-link[data-drink-id="wine"]');

    // Verify the detail link shows the same units
    const linkUnitsText = await wineDetailLink.locator('.detail-units').textContent();
    expect(linkUnitsText).toContain(wineUnits);

    // Get the href and verify it contains the correct query params
    const href = await wineDetailLink.getAttribute('href');
    expect(href).toContain('fromBar=1');
    expect(href).toContain(`units=${wineUnits}`);
  });

  test('Detail page shows bar context banner when coming from bar-setup', async ({ page }) => {
    // Go directly to a detail page with bar context params
    await page.goto('/wine-for-graduation-party-100-guests?fromBar=1&units=15&servings=75');
    await page.waitForLoadState('networkidle');

    // Verify the bar context banner is visible
    const banner = page.locator('#bar-context-banner');
    await expect(banner).toBeVisible();

    // Verify the banner shows the correct values
    const barUnits = await page.locator('#bar-units').textContent();
    expect(barUnits).toBe('15');

    const barServings = await page.locator('#bar-servings').textContent();
    expect(barServings).toBe('75');

    // Verify the back link is correct
    const backLink = page.locator('#back-to-bar');
    const href = await backLink.getAttribute('href');
    expect(href).toContain('/bar-setup/graduation-party-100-guests');
  });

  test('Detail page hides bar context banner when accessed directly', async ({ page }) => {
    // Go directly to a detail page without bar context params
    await page.goto('/wine-for-graduation-party-100-guests');
    await page.waitForLoadState('networkidle');

    // Verify the bar context banner is hidden
    const banner = page.locator('#bar-context-banner');
    await expect(banner).toHaveClass(/hidden/);
  });

  test('Full flow: Bar-setup -> Detail page -> Back to bar-setup', async ({ page }) => {
    // Start at bar-setup page
    await page.goto('/bar-setup/wedding-100-guests?drinks=wine,beer,champagne,spirits');
    await page.waitForLoadState('networkidle');

    // Get wine values
    const wineCard = page.locator('.drink-card[data-drink-id="wine"]');
    const originalWineUnits = await wineCard.locator('.drink-units').textContent();

    // Click on wine detail link
    await page.locator('.detail-link[data-drink-id="wine"]').click();
    await page.waitForLoadState('networkidle');

    // Verify we're on the detail page
    expect(page.url()).toContain('wine-for-wedding');

    // Verify the bar context banner shows correct units
    const barUnits = await page.locator('#bar-units').textContent();
    expect(barUnits).toBe(originalWineUnits);

    // Click back to bar-setup
    await page.locator('#back-to-bar').click();
    await page.waitForLoadState('networkidle');

    // Verify we're back on bar-setup
    expect(page.url()).toContain('/bar-setup/wedding-100-guests');
  });
});
