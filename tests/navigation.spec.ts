import { test, expect } from '@playwright/test';

test.describe('Navigation and Cross-linking', () => {
  test('Header navigation links work', async ({ page }) => {
    await page.goto('/');

    // Check desktop nav links exist
    const nav = page.locator('header nav[aria-label="Main"]');
    await expect(nav.locator('a:has-text("Drinks")')).toBeVisible();
    await expect(nav.locator('a:has-text("Food")')).toBeVisible();
    await expect(nav.locator('a:has-text("Full bar")')).toBeVisible();
    await expect(nav.locator('a:has-text("Occasions")')).toBeVisible();
    await expect(nav.locator('a:has-text("How the math works")')).toBeVisible();
    await expect(nav.locator('a:has-text("About")')).toBeVisible();
  });

  test('Food nav link goes to food page', async ({ page }) => {
    await page.goto('/');

    const foodLink = page.locator('header nav[aria-label="Main"] a:has-text("Food")').first();
    const href = await foodLink.getAttribute('href');
    expect(href).toMatch(/\/food\//);

    await foodLink.click();
    await expect(page).toHaveURL(/\/food\//);
  });

  test('Occasions nav link goes to the occasions index', async ({ page }) => {
    await page.goto('/');

    // A link named Occasions lands on the list of all occasions, not on one
    // rotating seasonal page.
    const occasionsLink = page.locator('header nav[aria-label="Main"] a:has-text("Occasions")');
    const href = await occasionsLink.getAttribute('href');
    expect(href).toBe('/calculators/');
  });

  test('Footer carries the rotating seasonal link under its own name', async ({ page }) => {
    await page.goto('/');

    // The seasonal link rotates monthly and is labeled with the event's name,
    // so assert on its target rather than a hardcoded name.
    const seasonalLink = page.locator('footer a[href*="/party/"]');
    await expect(seasonalLink.first()).toBeVisible();
    const name = await seasonalLink.first().textContent();
    expect(name?.trim().length).toBeGreaterThan(0);
  });

  test('Footer has drink and food hub links', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('footer a[href="/calculators/wine/"]')).toBeVisible();
    await expect(page.locator('footer a[href="/food/pizza/"]')).toBeVisible();
    await expect(page.locator('footer a[href="/methodology/"]')).toBeVisible();
  });

  test('Mobile menu has all navigation items', async ({ page }) => {
    // The mobile menu appears under the 900px breakpoint.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const menuButton = page.locator('#mobile-menu-btn');
    await menuButton.click();

    await expect(page.locator('#mobile-menu a:has-text("Drinks")')).toBeVisible();
    await expect(page.locator('#mobile-menu a:has-text("Food")')).toBeVisible();
    await expect(page.locator('#mobile-menu a:has-text("Occasions")')).toBeVisible();
  });

  test('Logo links to homepage', async ({ page }) => {
    await page.goto('/about/');

    const logo = page.locator('a:has-text("Stock the Event")').first();
    await logo.click();

    await expect(page).toHaveURL('/');
  });

  test('Cross-links from food to drinks work', async ({ page }) => {
    await page.goto('/food/pizza-for-super-bowl-party-50-guests/');

    // Look for drink calculator links
    const drinkLinks = page.locator('a[href*="beer-for"], a[href*="wine-for"]');
    const count = await drinkLinks.count();

    if (count > 0) {
      const href = await drinkLinks.first().getAttribute('href');
      expect(href).toMatch(/\/(beer|wine|champagne|spirits)-for-/);
    }
  });

  test('Cross-links from party page to calculators work', async ({ page }) => {
    await page.goto('/party/super-bowl-party-calculator/');

    // Should have links to food calculators
    const foodLinks = page.locator('a[href*="/food/"]');
    expect(await foodLinks.count()).toBeGreaterThan(0);

    // Should have links to drink calculators
    const drinkLinks = page.locator('a[href*="-for-super-bowl"]');
    expect(await drinkLinks.count()).toBeGreaterThan(0);
  });
});
