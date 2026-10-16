/**
 * generateFoodData.ts - Programmatic SEO Data Generator for Food Calculators
 *
 * Uses event-specific modifiers and food-specific serving calculations
 * to generate accurate food calculations for all page combinations.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import type {
  GuestCount,
  MathStep,
  ShoppingItem,
  RelatedPage,
  PageMeta,
  FoodCalculatorPage,
  FoodCalculationResult,
  FoodLedgerRow,
} from '../src/lib/types';
import { foodItems, type FoodItem } from '../src/data/foodItems';
import { events, type ExtendedEventType } from '../src/data/events';
import { guestCounts } from '../src/data/guestCounts';
import { items as drinkItems } from '../src/data/items';

import { BUFFER_PERCENTAGE, EATING_PERCENTAGE } from '../src/data/model';

// =============================================================================
// CALCULATION ENGINE
// =============================================================================

function calculateFoodServings(
  guests: number,
  guestTier: string,
  servingsPerPerson: number,
  eventModifier: number
): number {
  const eatingPercentage = EATING_PERCENTAGE[guestTier];
  const actualEaters = guests * eatingPercentage;

  // Base calculation: eaters × servings per person × event modifier
  const baseServings = actualEaters * servingsPerPerson * eventModifier;

  return Math.round(baseServings);
}

function calculateUnitsNeeded(
  totalServings: number,
  servingsPerOrderUnit: number
): number {
  const rawUnits = totalServings / servingsPerOrderUnit;
  const withBuffer = rawUnits * (1 + BUFFER_PERCENTAGE);
  return Math.ceil(withBuffer);
}

function calculate(
  item: FoodItem,
  event: ExtendedEventType,
  guestCount: GuestCount,
  isMainDish: boolean = true
): FoodCalculationResult {
  const modifier = event.foodModifiers?.[item.id] ?? 1.0;
  const servingsPerPerson = isMainDish ? item.servingsPerPerson : item.servingsPerPersonSide;

  const totalServings = calculateFoodServings(
    guestCount.value,
    guestCount.tier,
    servingsPerPerson,
    modifier
  );

  const rawUnits = totalServings / item.servingsPerOrderUnit;
  const unitsNeeded = calculateUnitsNeeded(totalServings, item.servingsPerOrderUnit);
  const buffer = unitsNeeded - Math.ceil(rawUnits);

  const unitsDisplay = unitsNeeded === 1 ? item.orderUnitSingular : item.orderUnit;
  const perPersonServings = Math.round((totalServings / guestCount.value) * 10) / 10;

  return {
    totalServings,
    unitsNeeded,
    unitsDisplay,
    perPersonServings,
    buffer,
    rawUnits: Math.round(rawUnits * 10) / 10,
    totalGuests: guestCount.value,
    isMainDish,
  };
}

// =============================================================================
// MATH EXPLANATION GENERATOR
// =============================================================================

function generateMathExplanation(
  item: FoodItem,
  event: ExtendedEventType,
  guestCount: GuestCount,
  result: FoodCalculationResult
): MathStep[] {
  const modifier = event.foodModifiers?.[item.id] ?? 1.0;
  const eatingPct = EATING_PERCENTAGE[guestCount.tier];
  const actualEaters = Math.round(guestCount.value * eatingPct);
  const servingsPerPerson = result.isMainDish ? item.servingsPerPerson : item.servingsPerPersonSide;
  const dishType = result.isMainDish ? 'main dish' : 'side/appetizer';

  const steps: MathStep[] = [
    {
      step: 1,
      label: 'Estimate actual eaters',
      formula: `${guestCount.value} guests × ${Math.round(eatingPct * 100)}% eating rate`,
      result: `${actualEaters} eaters`,
      explanation: `At ${guestCount.tier} events, about ${Math.round(eatingPct * 100)}% of guests will eat full servings.`,
    },
    {
      step: 2,
      label: `Calculate servings (as ${dishType})`,
      formula: `${actualEaters} eaters × ${servingsPerPerson} ${item.unitType === 'weight' ? 'pieces' : item.unit} per person`,
      result: `${Math.round(actualEaters * servingsPerPerson)} base servings`,
      explanation: item.unitType === 'weight'
        ? `As a ${dishType}, plan for ${servingsPerPerson} pieces per person (~${(servingsPerPerson / item.servingsPerOrderUnit).toFixed(1)} ${item.orderUnitSingular}).`
        : `As a ${dishType}, plan for ${servingsPerPerson} ${item.unit} per person.`,
    },
    {
      step: 3,
      label: `Apply ${event.lowerName} modifier`,
      formula: `× ${modifier} (${modifier > 1 ? '+' : ''}${Math.round((modifier - 1) * 100)}% for ${item.name.toLowerCase()})`,
      result: `${result.totalServings} ${item.unitType === 'weight' ? 'pieces' : item.unit} needed`,
      explanation: modifier !== 1
        ? `${event.pluralName} typically consume ${Math.abs(Math.round((modifier - 1) * 100))}% ${modifier > 1 ? 'more' : 'less'} ${item.name.toLowerCase()} than average.`
        : `${event.pluralName} have standard ${item.name.toLowerCase()} consumption.`,
    },
    {
      step: 4,
      label: `Convert to ${item.orderUnit}`,
      formula: `${result.totalServings} ${item.unitType === 'weight' ? 'pieces' : item.unit} ÷ ${item.servingsPerOrderUnit} per ${item.orderUnitSingular}`,
      result: `${result.rawUnits} ${item.orderUnit} (raw)`,
      explanation: `Each ${item.orderUnitSingular} provides ${item.servingsPerOrderUnit} ${item.unitType === 'weight' ? 'pieces' : item.unit}.`,
    },
    {
      step: 5,
      label: 'Add 15% buffer & round up',
      formula: `${result.rawUnits} × 1.15 = ${(result.rawUnits * 1.15).toFixed(1)}, rounded up`,
      result: `${result.unitsNeeded} ${result.unitsDisplay}`,
      explanation: 'Always round up and add a buffer. Running out of food is worse than having leftovers!',
    },
  ];

  return steps;
}

// =============================================================================
// SHOPPING LIST GENERATOR
// =============================================================================

function generateShoppingList(
  item: FoodItem,
  result: FoodCalculationResult
): ShoppingItem[] {
  const list: ShoppingItem[] = [];

  // Main item
  list.push({
    name: item.name,
    quantity: result.unitsNeeded,
    unit: result.unitsDisplay,
    affiliateCategory: item.id,
  });

  // Add complementary items based on food type
  if (item.id === 'pizza') {
    list.push(
      { name: 'Paper plates', quantity: Math.ceil(result.totalGuests * 1.5), unit: 'plates', notes: 'For slices and seconds', affiliateCategory: 'paper-plates' },
      { name: 'Napkins', quantity: Math.ceil(result.totalGuests * 3), unit: 'napkins', notes: 'Pizza is messy!', affiliateCategory: 'napkins' },
      { name: 'Red pepper flakes', quantity: 2, unit: 'shakers', notes: 'Table condiment' },
      { name: 'Parmesan cheese', quantity: 1, unit: 'container', notes: 'Grated for topping' },
    );
  } else if (item.id === 'wings') {
    list.push(
      { name: 'Ranch/Blue cheese dressing', quantity: Math.ceil(result.unitsNeeded / 3), unit: 'bottles', notes: 'Essential for wings' },
      { name: 'Celery sticks', quantity: Math.ceil(result.totalGuests / 4), unit: 'bunches', notes: 'Classic pairing' },
      { name: 'Wet wipes', quantity: Math.ceil(result.totalGuests * 2), unit: 'wipes', notes: 'Wing fingers!' },
      { name: 'Warming trays', quantity: Math.ceil(result.unitsNeeded / 10), unit: 'trays', notes: 'Keep wings hot', affiliateCategory: 'warming-tray' },
    );
  } else if (item.id === 'tacos') {
    list.push(
      { name: 'Salsa', quantity: Math.ceil(result.totalGuests / 8), unit: 'jars', notes: 'Mild and hot options' },
      { name: 'Sour cream', quantity: Math.ceil(result.totalGuests / 10), unit: 'containers' },
      { name: 'Lime wedges', quantity: Math.ceil(result.totalGuests / 2), unit: 'limes' },
      { name: 'Cilantro', quantity: Math.ceil(result.totalGuests / 15), unit: 'bunches' },
    );
  } else if (item.id === 'sliders') {
    list.push(
      { name: 'Slider buns', quantity: result.unitsNeeded, unit: 'buns', notes: 'Match to patties' },
      { name: 'Cheese slices', quantity: result.unitsNeeded, unit: 'slices', notes: 'American or cheddar' },
      { name: 'Pickles', quantity: Math.ceil(result.totalGuests / 10), unit: 'jars', notes: 'Sliced for burgers' },
      { name: 'Ketchup/Mustard', quantity: 2, unit: 'bottles' },
    );
  } else if (item.id === 'appetizers') {
    list.push(
      { name: 'Serving platters', quantity: Math.ceil(result.unitsNeeded / 30), unit: 'platters', notes: 'For presentation', affiliateCategory: 'serving-platters' },
      { name: 'Cocktail napkins', quantity: Math.ceil(result.totalGuests * 4), unit: 'napkins', affiliateCategory: 'napkins' },
      { name: 'Toothpicks', quantity: 1, unit: 'box', notes: 'For skewered items' },
      { name: 'Small plates', quantity: Math.ceil(result.totalGuests * 1.5), unit: 'plates', affiliateCategory: 'paper-plates' },
    );
  } else if (item.id === 'bbq') {
    list.push(
      { name: 'Hamburger buns', quantity: Math.ceil(result.unitsNeeded * 3), unit: 'buns', notes: 'For pulled pork sandwiches' },
      { name: 'BBQ sauce', quantity: Math.ceil(result.unitsNeeded / 3), unit: 'bottles', notes: 'Extra for dipping' },
      { name: 'Coleslaw', quantity: Math.ceil(result.totalGuests / 4), unit: 'lbs', notes: 'Classic BBQ side' },
      { name: 'Pickles', quantity: Math.ceil(result.totalGuests / 15), unit: 'jars' },
    );
  }

  return list;
}

// =============================================================================
// RELATED PAGES GENERATOR
// =============================================================================

function generateRelatedPages(
  currentItem: FoodItem,
  currentEvent: ExtendedEventType
): RelatedPage[] {
  const related: RelatedPage[] = [];

  // Same event, different food items
  foodItems.forEach(item => {
    if (item.id !== currentItem.id) {
      related.push({
        slug: `${item.id}-for-${currentEvent.slug}`,
        title: `${item.name} for ${currentEvent.name}`,
        relationship: 'same-event',
      });
    }
  });

  // Same item, the next four other events in list order, wrapping, so every
  // event page is linked from a different set of neighbors.
  const start = events.findIndex(e => e.id === currentEvent.id);
  for (let step = 1; step <= 4; step++) {
    const event = events[(start + step) % events.length];
    related.push({
      slug: `${currentItem.id}-for-${event.slug}`,
      title: `${currentItem.name} for ${event.name}`,
      relationship: 'same-item',
    });
  }

  return related;
}

// Generate cross-links to drink calculators
function generateRelatedDrinks(
  currentEvent: ExtendedEventType
): RelatedPage[] {
  const related: RelatedPage[] = [];

  // Get top 3 drinks for this event type based on modifiers
  const sortedDrinks = [...drinkItems].sort((a, b) => {
    const modA = currentEvent.modifiers[a.id] || 1.0;
    const modB = currentEvent.modifiers[b.id] || 1.0;
    return modB - modA;
  }).slice(0, 3);

  sortedDrinks.forEach(drink => {
    related.push({
      slug: `${drink.id}-for-${currentEvent.slug}`,
      title: `${drink.name} for ${currentEvent.name}`,
      relationship: 'same-event',
    });
  });

  return related;
}

// =============================================================================
// META/SEO GENERATOR
// =============================================================================

function generateMeta(
  item: FoodItem,
  event: ExtendedEventType
): PageMeta {
  const first = guestCounts[0].value;
  const last = guestCounts[guestCounts.length - 1].value;
  return {
    title: `How Much ${item.name} for a ${event.name}? Calculator and Chart`,
    description: `How much ${item.name.toLowerCase()} to order for a ${event.lowerName}, for ${first} to ${last} guests. Pick your guest count for an exact quantity, a shopping list and pro tips.`,
    h1: `How Much ${item.name} Do You Need for a ${event.name}?`,
  };
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

function generateAllFoodPages(): FoodCalculatorPage[] {
  const pages: FoodCalculatorPage[] = [];

  for (const item of foodItems) {
    for (const event of events) {
      // Calculated as a main dish (the default), once per guest count.
      const ledger: FoodLedgerRow[] = guestCounts.map((gc) => ({
        guests: gc.value,
        calculation: calculate(item, event, gc, true),
      }));
      const guestCount = guestCounts.find((gc) => gc.value === event.defaultGuests);
      if (!guestCount) {
        throw new Error(`${event.id}: defaultGuests ${event.defaultGuests} is not in guestCounts`);
      }
      const calculation = ledger.find((row) => row.guests === guestCount.value)!.calculation;

      pages.push({
        slug: `${item.id}-for-${event.slug}`,
        item,
        event,
        guestCount,
        calculation,
        ledger,
        meta: generateMeta(item, event),
        mathExplanation: generateMathExplanation(item, event, guestCount, calculation),
        shoppingList: generateShoppingList(item, calculation),
        relatedPages: generateRelatedPages(item, event),
        relatedDrinks: generateRelatedDrinks(event),
      });
    }
  }

  return pages;
}

// =============================================================================
// FILE OUTPUT
// =============================================================================

function writeDataFiles(pages: FoodCalculatorPage[]): void {
  const outputDir = path.join(__dirname, '../src/content/food-calculators');

  // Start clean so pages from an older URL scheme cannot linger and be built.
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });

  // Write individual page JSON files
  for (const page of pages) {
    const filePath = path.join(outputDir, `${page.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(page, null, 2));
  }

  console.log(`Generated ${pages.length} food calculator pages`);
}

// Run generation
const pages = generateAllFoodPages();
writeDataFiles(pages);

// Stats
console.log('\n--- Food Generation Stats ---');
console.log(`Food items: ${foodItems.length}`);
console.log(`Events: ${events.length}`);
console.log(`Guest counts: ${guestCounts.length}`);
console.log(`Total food pages: ${foodItems.length * events.length}`);
