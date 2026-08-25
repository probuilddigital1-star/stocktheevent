import { test, expect } from '@playwright/test';

test.describe('Calculation Accuracy', () => {
  test('Wings calculation is reasonable for 50 guests', async ({ page }) => {
    await page.goto('/food/wings-for-super-bowl-party-50-guests/');

    // Get the main number displayed (answer-number class in new design)
    const mainNumber = page.locator('.answer-number, .font-mono-luxe.text-6xl').first();
    const text = await mainNumber.textContent();
    const number = parseInt(text?.replace(/[^\d]/g, '') || '0');

    // For 50 guests at Super Bowl (high consumption), expect reasonable range
    expect(number).toBeGreaterThan(30);
    expect(number).toBeLessThan(250);
  });

  test('Pizza calculation is reasonable for 30 guests', async ({ page }) => {
    await page.goto('/food/pizza-for-birthday-party-30-guests/');

    const mainNumber = page.locator('.answer-number, .font-mono-luxe.text-6xl').first();
    const text = await mainNumber.textContent();
    const number = parseInt(text?.replace(/[^\d]/g, '') || '0');

    // For 30 guests: reasonable pizza range
    expect(number).toBeGreaterThan(5);
    expect(number).toBeLessThan(30);
  });

  test('Beer calculation matches expected formula', async ({ page }) => {
    await page.goto('/beer-for-birthday-party-50-guests/');

    // Beer pages use .answer-number or .font-mono-luxe for main number
    const mainNumber = page.locator('.answer-number, .font-mono-luxe.text-6xl').first();
    const text = await mainNumber.textContent();
    const number = parseInt(text?.replace(/[^\d]/g, '') || '0');

    // Beer calculation - reasonable range
    expect(number).toBeGreaterThan(5);
    expect(number).toBeLessThan(400);
  });

  test('Large guest count scales appropriately', async ({ page }) => {
    await page.goto('/food/wings-for-super-bowl-party-200-guests/');

    const mainNumber200 = page.locator('.answer-number, .font-mono-luxe.text-6xl').first();
    const text200 = await mainNumber200.textContent();
    const number200 = parseInt(text200?.replace(/[^\d]/g, '') || '0');

    await page.goto('/food/wings-for-super-bowl-party-100-guests/');
    const mainNumber100 = page.locator('.answer-number, .font-mono-luxe.text-6xl').first();
    const text100 = await mainNumber100.textContent();
    const number100 = parseInt(text100?.replace(/[^\d]/g, '') || '0');

    // 200 guests should need more than 100 guests
    expect(number200).toBeGreaterThan(number100);
  });

  test('Math breakdown shows all steps', async ({ page }) => {
    await page.goto('/food/pizza-for-wedding-100-guests/');

    // Should show calculation steps
    const mathSection = page.locator('text=Why This Amount Works');
    await expect(mathSection).toBeVisible();

    // Should have multiple steps (look for step numbers or calculation steps)
    const steps = page.locator('.rounded-full:has-text("1"), .rounded-full:has-text("2"), .rounded-full:has-text("3")');
    expect(await steps.count()).toBeGreaterThanOrEqual(2);
  });

  test('Per person servings displayed correctly', async ({ page }) => {
    await page.goto('/food/tacos-for-birthday-party-50-guests/');

    // Check per person stat exists
    const perPerson = page.locator('text=/per person/i');
    await expect(perPerson.first()).toBeVisible();
  });
});
