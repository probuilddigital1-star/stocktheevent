import { test, expect } from '@playwright/test';

test.describe('Navigation and Cross-linking', () => {
  test('Header navigation links work', async ({ page }) => {
    await page.goto('/');

    // Check desktop nav links exist
    await expect(page.locator('nav a:has-text("Drinks")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Food")')).toBeVisible();
    await expect(page.locator('nav a:has-text("Seasonal")')).toBeVisible();
    await expect(page.locator('nav a:has-text("About")')).toBeVisible();
  });

  test('Food nav link goes to food page', async ({ page }) => {
    await page.goto('/');

    const foodLink = page.locator('nav a:has-text("Food")').first();
    const href = await foodLink.getAttribute('href');
    expect(href).toMatch(/\/food\//);

    await foodLink.click();
    await expect(page).toHaveURL(/\/food\//);
  });

  test('Seasonal nav link goes to party page', async ({ page }) => {
    await page.goto('/');

    const seasonalLink = page.locator('nav a:has-text("Seasonal")').first();
    const href = await seasonalLink.getAttribute('href');
    expect(href).toMatch(/\/party\//);
  });

  test('Footer has seasonal party links', async ({ page }) => {
    await page.goto('/');

    // Check footer seasonal links
    await expect(page.locator('footer a:has-text("Super Bowl")')).toBeVisible();
    await expect(page.locator('footer a:has-text("Graduation")')).toBeVisible();
    await expect(page.locator('footer a:has-text("4th of July")')).toBeVisible();
    await expect(page.locator('footer a:has-text("Christmas")')).toBeVisible();
  });

  test('Footer has food calculator links', async ({ page }) => {
    await page.goto('/');

    // Check footer food links
    await expect(page.locator('footer a:has-text("Wings")')).toBeVisible();
    await expect(page.locator('footer a:has-text("Pizza")')).toBeVisible();
  });

  test('Mobile menu has all navigation items', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Open mobile menu
    const menuButton = page.locator('button[aria-label="Menu"]');
    await menuButton.click();

    // Check mobile menu links
    await expect(page.locator('#mobile-menu a:has-text("Drink")')).toBeVisible();
    await expect(page.locator('#mobile-menu a:has-text("Food")')).toBeVisible();
    await expect(page.locator('#mobile-menu a:has-text("Seasonal")')).toBeVisible();
  });

  test('Logo links to homepage', async ({ page }) => {
    await page.goto('/about/');

    const logo = page.locator('a:has-text("StockTheEvent")').first();
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
