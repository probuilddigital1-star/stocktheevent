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

// Helper to select drinks by clicking the toggle buttons (aria-pressed carries
// the selection state)
async function selectDrinks(page: Page, drinkIds: string[]) {
  const toggles = page.locator('.drink-toggle');
  const count = await toggles.count();

  // First make sure at least one wanted drink is on, so deselecting the rest
  // never hits the "last drink cannot be removed" guard.
  for (let i = 0; i < count; i++) {
    const btn = toggles.nth(i);
    const itemId = await btn.getAttribute('data-item');
    if (drinkIds.includes(itemId || '') && (await btn.getAttribute('aria-pressed')) !== 'true') {
      await btn.click();
    }
  }
  for (let i = 0; i < count; i++) {
    const btn = toggles.nth(i);
    const itemId = await btn.getAttribute('data-item');
    if (!drinkIds.includes(itemId || '') && (await btn.getAttribute('aria-pressed')) === 'true') {
      await btn.click();
    }
  }
}

// Helper to change event
async function selectEvent(page: Page, eventId: string) {
  await page.selectOption('#event-select', eventId);
  await page.waitForTimeout(100);
}

// Helper to type a guest count into the stepper's number input
async function setGuests(page: Page, guests: number) {
  await page.fill('#guest-input', String(guests));
  await page.dispatchEvent('#guest-input', 'change');
  await page.waitForTimeout(100);
}

// Helper to type an hour count into the stepper's number input
async function setDuration(page: Page, hours: number) {
  await page.fill('#duration-input', String(hours));
  await page.dispatchEvent('#duration-input', 'change');
  await page.waitForTimeout(100);
}

// Visible rows of the "Your bar" table
function visibleRows(page: Page) {
  return page.locator('#bar-table tr[data-drink-id]:not([hidden])');
}

// Helper to check all displayed numbers for NaN
async function checkForNaN(page: Page): Promise<{ hasNaN: boolean; locations: string[] }> {
  const locations: string[] = [];

  const rows = visibleRows(page);
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const units = await rows.nth(i).locator('.drink-units').textContent();
    if (!units || isInvalidNumber(units)) {
      locations.push(`bar row[${i}] units: "${units}"`);
    }
  }

  const total = await page.locator('#bar-total').textContent();
  if (!total || isInvalidNumber(total)) {
    locations.push(`bar-total: "${total}"`);
  }

  const note = await page.locator('#calc-note').textContent();
  if (note && note.toLowerCase().includes('nan')) {
    locations.push(`calc-note: "${note}"`);
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
        await selectDrinks(page, [drink]);
        await selectEvent(page, event.id);

        const { hasNaN, locations } = await checkForNaN(page);
        expect(hasNaN, `NaN found in: ${locations.join(', ')}`).toBe(false);

        // Exactly one visible row, with a positive unit count
        expect(await visibleRows(page).count()).toBe(1);
        const units = await visibleRows(page).first().locator('.drink-units').textContent();
        expect(parseInt(units || '0')).toBeGreaterThan(0);
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
      expect(await visibleRows(page).count()).toBe(2);
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

      expect(await visibleRows(page).count()).toBe(4);
      const total = await page.locator('#bar-total').textContent();
      expect(parseInt(total || '0')).toBeGreaterThan(0);
    });
  }
});

test.describe('Interactive Calculator - Calculation Validity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Changing guest count updates calculations correctly', async ({ page }) => {
    await selectDrinks(page, ['wine']);
    await selectEvent(page, 'wedding');

    const initial = await visibleRows(page).first().locator('.drink-units').textContent();
    const initialNum = parseInt(initial || '0');

    await setGuests(page, 300);

    const afterMax = await visibleRows(page).first().locator('.drink-units').textContent();
    const afterMaxNum = parseInt(afterMax || '0');

    expect(afterMaxNum).toBeGreaterThan(initialNum);
    expect(isInvalidNumber(afterMax || '')).toBe(false);
  });

  test('Changing hours updates calculations correctly', async ({ page }) => {
    await selectDrinks(page, ['beer']);
    await selectEvent(page, 'super-bowl');

    const initial = await visibleRows(page).first().locator('.drink-units').textContent();
    const initialNum = parseInt(initial || '0');

    await setDuration(page, 1);

    const afterMin = await visibleRows(page).first().locator('.drink-units').textContent();
    const afterMinNum = parseInt(afterMin || '0');

    expect(afterMinNum).toBeLessThanOrEqual(initialNum);
    expect(isInvalidNumber(afterMin || '')).toBe(false);
  });

  test('Adding drinks divides the total rather than growing it', async ({ page }) => {
    // Total drinks are fixed by guests and duration. Selecting all four drinks
    // splits that total, so no single drink can come out higher than it does
    // when it is the only thing being served.
    await selectDrinks(page, ['wine']);
    await selectEvent(page, 'wedding');
    const alone = parseInt(
      (await visibleRows(page).first().locator('.drink-units').textContent()) || '0',
    );

    await selectDrinks(page, ['wine', 'beer', 'champagne', 'spirits']);
    const shared = await page
      .locator('#bar-table tr[data-drink-id="wine"] .drink-units')
      .textContent();

    expect(parseInt(shared || '0')).toBeLessThan(alone);
    expect(parseInt(shared || '0')).toBeGreaterThan(0);
  });

  test('Event-specific modifiers affect calculations', async ({ page }) => {
    await selectDrinks(page, ['beer']);

    await selectEvent(page, 'super-bowl');
    const superBowlBeer = await visibleRows(page).first().locator('.drink-units').textContent();
    const superBowlNum = parseInt(superBowlBeer || '0');

    await selectEvent(page, 'wedding');
    const weddingBeer = await visibleRows(page).first().locator('.drink-units').textContent();
    const weddingNum = parseInt(weddingBeer || '0');

    // Super Bowl has +40% beer modifier, wedding has -10%
    expect(superBowlNum).toBeGreaterThanOrEqual(weddingNum);
    expect(isInvalidNumber(superBowlBeer || '')).toBe(false);
    expect(isInvalidNumber(weddingBeer || '')).toBe(false);
  });

  test('The last selected drink cannot be removed', async ({ page }) => {
    await selectDrinks(page, ['wine']);
    await page.locator('.drink-toggle[data-item="wine"]').click();
    await expect(page.locator('.drink-toggle[data-item="wine"]')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await visibleRows(page).count()).toBe(1);
  });

  test('Single drink links to its calculator page, several to bar setup', async ({ page }) => {
    await selectDrinks(page, ['wine']);
    await selectEvent(page, 'wedding');
    expect(await page.locator('#detail-link').getAttribute('href')).toContain(
      '/wine-for-wedding-100-guests/',
    );

    await selectDrinks(page, ['wine', 'beer']);
    expect(await page.locator('#detail-link').getAttribute('href')).toContain(
      '/bar-setup/wedding-100-guests/',
    );
  });
});

test.describe('Bar Setup Page - NaN Tests', () => {
  // Test the bar-setup pages directly for each event
  for (const event of EVENTS) {
    test(`Bar setup page for ${event.name} with all drinks - should not have NaN`, async ({ page }) => {
      const url = `/bar-setup/${event.id === 'wedding' ? 'wedding' :
        event.id === 'graduation' ? 'graduation-party' :
        event.id === 'corporate' ? 'corporate-event' :
        event.id === 'birthday' ? 'birthday-party' :
        event.id === 'super-bowl' ? 'super-bowl-party' :
        event.id === 'holiday-party' ? 'holiday-party' :
        'wedding-shower'}-100-guests/?drinks=wine,beer,champagne,spirits`;

      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const drinkCards = page.locator('.drink-card');
      const count = await drinkCards.count();

      for (let i = 0; i < count; i++) {
        const card = drinkCards.nth(i);
        const units = await card.locator('.drink-units').textContent();
        const servings = await card.locator('.drink-servings').textContent();

        expect(isInvalidNumber(units || ''), `Drink card ${i} units is NaN: "${units}"`).toBe(false);
        expect((servings || '').includes('NaN'), `Drink card ${i} servings contains NaN: "${servings}"`).toBe(false);
      }

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

    await selectDrinks(page, ['wine', 'beer', 'champagne', 'spirits']);

    for (const event of EVENTS) {
      await selectEvent(page, event.id);
    }

    const { hasNaN, locations } = await checkForNaN(page);
    expect(hasNaN, `NaN found after rapid switching: ${locations.join(', ')}`).toBe(false);
  });

  test('Minimum guests (10) should not cause NaN', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await selectDrinks(page, ['wine', 'beer', 'champagne', 'spirits']);
    await setGuests(page, 10);

    for (const event of EVENTS) {
      await selectEvent(page, event.id);
      const { hasNaN, locations } = await checkForNaN(page);
      expect(hasNaN, `NaN at min guests for ${event.name}: ${locations.join(', ')}`).toBe(false);
    }
  });

  test('Maximum guests (300) should not cause NaN', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await selectDrinks(page, ['wine', 'beer', 'champagne', 'spirits']);
    await setGuests(page, 300);

    for (const event of EVENTS) {
      await selectEvent(page, event.id);
      const { hasNaN, locations } = await checkForNaN(page);
      expect(hasNaN, `NaN at max guests for ${event.name}: ${locations.join(', ')}`).toBe(false);
    }
  });
});

test.describe('Stepper behavior', () => {
  test('Guest stepper defaults to 100 and steps through page counts', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#guest-input')).toHaveValue('100');

    // Plus steps to the next generated guest count (125), minus back to 100
    await page.locator('#guest-stepper [data-step="up"]').click();
    await expect(page.locator('#guest-input')).toHaveValue('125');
    await page.locator('#guest-stepper [data-step="down"]').click();
    await expect(page.locator('#guest-input')).toHaveValue('100');
  });

  test('Typed guest counts are clamped to 10-300', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await setGuests(page, 5000);
    await expect(page.locator('#guest-input')).toHaveValue('300');

    await setGuests(page, 1);
    await expect(page.locator('#guest-input')).toHaveValue('10');
  });

  test('Hour stepper steps by one within 1-6', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wedding default is 5 hours
    await expect(page.locator('#duration-input')).toHaveValue('5');
    await page.locator('#duration-stepper [data-step="up"]').click();
    await expect(page.locator('#duration-input')).toHaveValue('6');
    await page.locator('#duration-stepper [data-step="up"]').click();
    await expect(page.locator('#duration-input')).toHaveValue('6');
  });

  test('Changing the occasion resets hours to its default', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await setDuration(page, 2);
    await selectEvent(page, 'corporate');
    await expect(page.locator('#duration-input')).toHaveValue('3');
  });

  test('Context line follows guests and hours', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await setGuests(page, 150);
    await setDuration(page, 4);
    await expect(page.locator('#calc-context')).toHaveText('150 guests · 4 hours');
  });
});
