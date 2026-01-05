import { test, expect, Page } from '@playwright/test';

// All events in the system with their IDs
const EVENTS = [
  { id: 'wedding', name: 'Wedding' },
  { id: 'graduation', name: 'Graduation Party' },
  { id: 'corporate', name: 'Corporate Event' },
  { id: 'birthday', name: 'Birthday Party' },
  { id: 'super-bowl', name: 'Super Bowl Party' },
  { id: 'holiday-party', name: 'Holiday Party' },
  { id: 'wedding-shower', name: 'Wedding Shower' },
];

// All drink types
const DRINKS = ['wine', 'beer', 'champagne', 'spirits'];

// Helper to check if a value is NaN or invalid
function isInvalidNumber(value: string): boolean {
  const num = parseFloat(value);
  return isNaN(num) || !isFinite(num) || value.toLowerCase().includes('nan');
}

// Helper to select drinks by clicking on drink buttons
async function selectDrinks(page: Page, drinkIds: string[]) {
  // First, get all currently selected drinks
  const buttons = page.locator('.item-btn');
  const count = await buttons.count();

  // Click to deselect all except the ones we want
  for (let i = 0; i < count; i++) {
    const btn = buttons.nth(i);
    const itemId = await btn.getAttribute('data-item');
    const isSelected = await btn.evaluate(el => el.classList.contains('selected'));
    const shouldBeSelected = drinkIds.includes(itemId || '');

    if (isSelected !== shouldBeSelected) {
      await btn.click();
      await page.waitForTimeout(100); // Small delay for animation
    }
  }
}

// Helper to change event
async function selectEvent(page: Page, eventId: string) {
  await page.selectOption('#event-select', eventId);
  await page.waitForTimeout(200); // Wait for recalculation
}

// Helper to check all displayed numbers for NaN
async function checkForNaN(page: Page): Promise<{ hasNaN: boolean; locations: string[] }> {
  const locations: string[] = [];

  // Check result units
  const resultUnits = await page.locator('#result-units').textContent();
  if (resultUnits && isInvalidNumber(resultUnits)) {
    locations.push(`result-units: "${resultUnits}"`);
  }

  // Check result servings
  const resultServings = await page.locator('#result-servings').textContent();
  if (resultServings && isInvalidNumber(resultServings)) {
    locations.push(`result-servings: "${resultServings}"`);
  }

  // Check result per person
  const resultPerPerson = await page.locator('#result-per-person').textContent();
  if (resultPerPerson && isInvalidNumber(resultPerPerson)) {
    locations.push(`result-per-person: "${resultPerPerson}"`);
  }

  // Check total items (for full bar)
  const totalItems = await page.locator('#total-items').textContent();
  if (totalItems && isInvalidNumber(totalItems)) {
    locations.push(`total-items: "${totalItems}"`);
  }

  // Check all drink cards in multi-drink grid
  const multiDrinkCards = page.locator('#multi-drink-grid .drink-card');
  const multiCount = await multiDrinkCards.count();
  for (let i = 0; i < multiCount; i++) {
    const card = multiDrinkCards.nth(i);
    const units = await card.locator('.text-2xl.font-bold').textContent();
    if (units && isInvalidNumber(units)) {
      locations.push(`multi-drink-card[${i}] units: "${units}"`);
    }
  }

  // Check all drink cards in full bar grid
  const fullbarCards = page.locator('#fullbar-grid .drink-card-sm');
  const fullbarCount = await fullbarCards.count();
  for (let i = 0; i < fullbarCount; i++) {
    const card = fullbarCards.nth(i);
    const units = await card.locator('.font-bold').textContent();
    if (units && isInvalidNumber(units)) {
      locations.push(`fullbar-card[${i}] units: "${units}"`);
    }
  }

  return { hasNaN: locations.length > 0, locations };
}

test.describe('Interactive Calculator - NaN Bug Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Test single drink selection for all events
  for (const event of EVENTS) {
    for (const drink of DRINKS) {
      test(`Single ${drink} for ${event.name} - should not have NaN`, async ({ page }) => {
        // Select only this drink
        await selectDrinks(page, [drink]);

        // Select the event
        await selectEvent(page, event.id);

        // Check for NaN
        const { hasNaN, locations } = await checkForNaN(page);

        expect(hasNaN, `NaN found in: ${locations.join(', ')}`).toBe(false);

        // Also verify the displayed value is a positive number
        const resultUnits = await page.locator('#result-units').textContent();
        expect(parseInt(resultUnits || '0')).toBeGreaterThan(0);
      });
    }
  }

  // Test 2-drink combinations for all events
  for (const event of EVENTS) {
    test(`Two drinks (wine+beer) for ${event.name} - should not have NaN`, async ({ page }) => {
      await selectDrinks(page, ['wine', 'beer']);
      await selectEvent(page, event.id);

      const { hasNaN, locations } = await checkForNaN(page);
      expect(hasNaN, `NaN found in: ${locations.join(', ')}`).toBe(false);

      // Verify multi-result panel is visible
      const multiResult = page.locator('#multi-result');
      await expect(multiResult).not.toHaveClass(/hidden/);
    });

    test(`Two drinks (champagne+spirits) for ${event.name} - should not have NaN`, async ({ page }) => {
      await selectDrinks(page, ['champagne', 'spirits']);
      await selectEvent(page, event.id);

      const { hasNaN, locations } = await checkForNaN(page);
      expect(hasNaN, `NaN found in: ${locations.join(', ')}`).toBe(false);
    });
  }

  // Test 3-drink combinations for all events
  for (const event of EVENTS) {
    test(`Three drinks (wine+beer+champagne) for ${event.name} - should not have NaN`, async ({ page }) => {
      await selectDrinks(page, ['wine', 'beer', 'champagne']);
      await selectEvent(page, event.id);

      const { hasNaN, locations } = await checkForNaN(page);
      expect(hasNaN, `NaN found in: ${locations.join(', ')}`).toBe(false);
    });
  }

  // Test full bar (4 drinks) for all events
  for (const event of EVENTS) {
    test(`Full bar (all 4 drinks) for ${event.name} - should not have NaN`, async ({ page }) => {
      await selectDrinks(page, ['wine', 'beer', 'champagne', 'spirits']);
      await selectEvent(page, event.id);

      const { hasNaN, locations } = await checkForNaN(page);
      expect(hasNaN, `NaN found in: ${locations.join(', ')}`).toBe(false);

      // Verify fullbar-result panel is visible
      const fullbarResult = page.locator('#fullbar-result');
      await expect(fullbarResult).not.toHaveClass(/hidden/);

      // Verify total items is a positive number
      const totalItems = await page.locator('#total-items').textContent();
      expect(parseInt(totalItems || '0')).toBeGreaterThan(0);
    });
  }
});

test.describe('Interactive Calculator - Calculation Validity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Changing guest count updates calculations correctly', async ({ page }) => {
    // Select wine and wedding
    await selectDrinks(page, ['wine']);
    await selectEvent(page, 'wedding');

    // Get initial value
    const initial = await page.locator('#result-units').textContent();
    const initialNum = parseInt(initial || '0');

    // Change guest slider to maximum (300 guests)
    await page.locator('#guest-slider').fill('11');
    await page.waitForTimeout(200);

    // Get new value
    const afterMax = await page.locator('#result-units').textContent();
    const afterMaxNum = parseInt(afterMax || '0');

    // Should be larger with more guests
    expect(afterMaxNum).toBeGreaterThan(initialNum);
    expect(isInvalidNumber(afterMax || '')).toBe(false);
  });

  test('Changing duration updates calculations correctly', async ({ page }) => {
    await selectDrinks(page, ['beer']);
    await selectEvent(page, 'super-bowl');

    // Get initial value at default duration (5 hours for super-bowl)
    const initial = await page.locator('#result-units').textContent();
    const initialNum = parseInt(initial || '0');

    // Change duration to minimum (1 hour)
    await page.locator('#duration-slider').fill('1');
    await page.waitForTimeout(200);

    // Get new value
    const afterMin = await page.locator('#result-units').textContent();
    const afterMinNum = parseInt(afterMin || '0');

    // Should be smaller or equal with less time (rounding may cause equal values)
    expect(afterMinNum).toBeLessThanOrEqual(initialNum);
    expect(isInvalidNumber(afterMin || '')).toBe(false);
  });

  test('Event-specific modifiers affect calculations', async ({ page }) => {
    await selectDrinks(page, ['beer']);

    // Super Bowl should have more beer than Wedding
    await selectEvent(page, 'super-bowl');
    const superBowlBeer = await page.locator('#result-units').textContent();
    const superBowlNum = parseInt(superBowlBeer || '0');

    await selectEvent(page, 'wedding');
    const weddingBeer = await page.locator('#result-units').textContent();
    const weddingNum = parseInt(weddingBeer || '0');

    // Super Bowl has +40% beer modifier, wedding has -10%
    // Due to ceiling/rounding, they might be equal
    expect(superBowlNum).toBeGreaterThanOrEqual(weddingNum);
    // Both should be valid numbers
    expect(isInvalidNumber(superBowlBeer || '')).toBe(false);
    expect(isInvalidNumber(weddingBeer || '')).toBe(false);
  });
});

test.describe('Bar Setup Page - NaN Tests', () => {
  // Test the bar-setup pages directly for each event
  for (const event of EVENTS) {
    test(`Bar setup page for ${event.name} with all drinks - should not have NaN`, async ({ page }) => {
      // Navigate to bar-setup page with all drinks
      const url = `/bar-setup/${event.id === 'wedding' ? 'wedding' :
        event.id === 'graduation' ? 'graduation-party' :
        event.id === 'corporate' ? 'corporate-event' :
        event.id === 'birthday' ? 'birthday-party' :
        event.id === 'super-bowl' ? 'super-bowl-party' :
        event.id === 'holiday-party' ? 'holiday-party' :
        'wedding-shower'}-100-guests?drinks=wine,beer,champagne,spirits`;

      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Check all drink cards
      const drinkCards = page.locator('.drink-card');
      const count = await drinkCards.count();

      for (let i = 0; i < count; i++) {
        const card = drinkCards.nth(i);
        const units = await card.locator('.drink-units').textContent();
        const servings = await card.locator('.drink-servings').textContent();

        expect(isInvalidNumber(units || ''), `Drink card ${i} units is NaN: "${units}"`).toBe(false);
        expect((servings || '').includes('NaN'), `Drink card ${i} servings contains NaN: "${servings}"`).toBe(false);
      }

      // Check totals
      const totalUnits = await page.locator('#total-units').textContent();
      const totalServings = await page.locator('#total-servings').textContent();
      const perPerson = await page.locator('#per-person').textContent();

      expect((totalUnits || '').includes('NaN'), `total-units contains NaN: "${totalUnits}"`).toBe(false);
      expect(isInvalidNumber(totalServings || ''), `total-servings is NaN: "${totalServings}"`).toBe(false);
      expect(isInvalidNumber(perPerson || ''), `per-person is NaN: "${perPerson}"`).toBe(false);
    });
  }
});

test.describe('Edge Cases', () => {
  test('Rapid event switching should not cause NaN', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Select all drinks
    await selectDrinks(page, ['wine', 'beer', 'champagne', 'spirits']);

    // Rapidly switch between events
    for (const event of EVENTS) {
      await selectEvent(page, event.id);
    }

    // Final check for NaN
    const { hasNaN, locations } = await checkForNaN(page);
    expect(hasNaN, `NaN found after rapid switching: ${locations.join(', ')}`).toBe(false);
  });

  test('Minimum guests (10) should not cause NaN', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Select all drinks
    await selectDrinks(page, ['wine', 'beer', 'champagne', 'spirits']);

    // Set to minimum guests
    await page.locator('#guest-slider').fill('0');
    await page.waitForTimeout(200);

    // Check all events
    for (const event of EVENTS) {
      await selectEvent(page, event.id);
      const { hasNaN, locations } = await checkForNaN(page);
      expect(hasNaN, `NaN at min guests for ${event.name}: ${locations.join(', ')}`).toBe(false);
    }
  });

  test('Maximum guests (300) should not cause NaN', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Select all drinks
    await selectDrinks(page, ['wine', 'beer', 'champagne', 'spirits']);

    // Set to maximum guests
    await page.locator('#guest-slider').fill('11');
    await page.waitForTimeout(200);

    // Check all events
    for (const event of EVENTS) {
      await selectEvent(page, event.id);
      const { hasNaN, locations } = await checkForNaN(page);
      expect(hasNaN, `NaN at max guests for ${event.name}: ${locations.join(', ')}`).toBe(false);
    }
  });
});
