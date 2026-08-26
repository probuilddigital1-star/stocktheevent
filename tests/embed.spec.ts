import { test, expect } from '@playwright/test';

test.describe('Embed calculator landing page', () => {
  test('renders an iframe pointing at /embed/ and a snippet containing the /embed/ URL', async ({ page }) => {
    await page.goto('/embed-calculator/');

    const iframe = page.locator('iframe[src="/embed/"]');
    await expect(iframe).toHaveCount(1);

    const snippet = await page.locator('#embed-snippet-code').textContent();
    expect(snippet).toContain('/embed/');
  });
});
