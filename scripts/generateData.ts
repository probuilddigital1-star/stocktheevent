/**
 * generateData.ts - Programmatic SEO Data Generator for StockTheEvent
 *
 * Uses bartender-refined formulas with consumption decay curves
 * to generate accurate drink calculations for all page combinations.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import type {
  Item,
  EventType,
  GuestCount,
  CalculationResult,
  MathStep,
  ShoppingItem,
  RelatedPage,
  PageMeta,
  CalculatorPage
} from '../src/lib/types';
import { items } from '../src/data/items';
import { events } from '../src/data/events';
import { guestCounts } from '../src/data/guestCounts';

// =============================================================================
// BARTENDER'S REFINED CONSTANTS
// =============================================================================

const BASE_DRINKS_PER_HOUR = 1.5; // Industry standard: 1.5 drinks/person/hour
const BUFFER_PERCENTAGE = 0.15;   // 15% buffer for safety

// Consumption decay curve - drinking slows over time
// Hour 1: 100%, Hour 2: 90%, Hour 3: 75%, Hour 4: 60%, Hour 5+: 50%
const HOURLY_DECAY = [1.0, 0.9, 0.75, 0.6, 0.5];

// Drinking percentage by guest count tier
// Larger events = lower percentage actually drinking
const DRINKING_PERCENTAGE: Record<string, number> = {
  small: 0.80,   // 80% of 10-30 guests drink
  medium: 0.75,  // 75% of 40-75 guests drink
  large: 0.70,   // 70% of 100-150 guests drink
  xlarge: 0.65,  // 65% of 200+ guests drink
};

// =============================================================================
// CALCULATION ENGINE
// =============================================================================

function calculateConsumptionMultiplier(durationHours: number): number {
  // Calculate total drinks considering decay curve
  let totalMultiplier = 0;
  for (let hour = 0; hour < durationHours; hour++) {
    const decayIndex = Math.min(hour, HOURLY_DECAY.length - 1);
    totalMultiplier += HOURLY_DECAY[decayIndex];
  }
  return totalMultiplier;
}

function calculateServings(
  guests: number,
  guestTier: string,
  durationHours: number,
  eventModifier: number
): number {
  const drinkingPercentage = DRINKING_PERCENTAGE[guestTier];
  const actualDrinkers = guests * drinkingPercentage;
  const consumptionMultiplier = calculateConsumptionMultiplier(durationHours);

  // Base calculation: drinkers × base rate × decay-adjusted hours × event modifier
  const baseServings = actualDrinkers * BASE_DRINKS_PER_HOUR * consumptionMultiplier * eventModifier;

  return Math.round(baseServings);
}

function calculateUnitsNeeded(servings: number, servingsPerUnit: number): number {
  const rawUnits = servings / servingsPerUnit;
  const withBuffer = rawUnits * (1 + BUFFER_PERCENTAGE);
  return Math.ceil(withBuffer);
}

function calculate(
  item: Item,
  event: EventType,
  guestCount: GuestCount
): CalculationResult {
  const modifier = event.modifiers[item.id] || 1.0;
  const drinkingPercentage = DRINKING_PERCENTAGE[guestCount.tier];
  const actualDrinkers = Math.round(guestCount.value * drinkingPercentage);

  const totalServings = calculateServings(
    guestCount.value,
    guestCount.tier,
    event.defaultDuration,
    modifier
  );

  const rawUnits = totalServings / item.servingsPerUnit;
  const unitsNeeded = calculateUnitsNeeded(totalServings, item.servingsPerUnit);
  const buffer = unitsNeeded - Math.ceil(rawUnits);

  const unitsDisplay = unitsNeeded === 1 ? item.unitSingular : item.unit;
  const perPersonServings = Math.round((totalServings / guestCount.value) * 10) / 10;

  return {
    totalServings,
    unitsNeeded,
    unitsDisplay,
    perPersonServings,
    buffer,
    rawUnits: Math.round(rawUnits * 10) / 10,
    actualDrinkers,
  };
}

// =============================================================================
// MATH EXPLANATION GENERATOR
// =============================================================================

function generateMathExplanation(
  item: Item,
  event: EventType,
  guestCount: GuestCount,
  result: CalculationResult
): MathStep[] {
  const modifier = event.modifiers[item.id] || 1.0;
  const drinkingPct = DRINKING_PERCENTAGE[guestCount.tier];
  const actualDrinkers = Math.round(guestCount.value * drinkingPct);
  const consumptionMult = calculateConsumptionMultiplier(event.defaultDuration);

  const steps: MathStep[] = [
    {
      step: 1,
      label: 'Estimate actual drinkers',
      formula: `${guestCount.value} guests × ${Math.round(drinkingPct * 100)}% drinking rate`,
      result: `${actualDrinkers} drinkers`,
      explanation: `At ${guestCount.tier} events, about ${Math.round(drinkingPct * 100)}% of guests typically drink alcohol.`,
    },
    {
      step: 2,
      label: 'Calculate base consumption',
      formula: `${actualDrinkers} drinkers × ${BASE_DRINKS_PER_HOUR} drinks/hour × ${event.defaultDuration} hours`,
      result: `${Math.round(actualDrinkers * BASE_DRINKS_PER_HOUR * event.defaultDuration)} base drinks`,
      explanation: `Industry standard is ${BASE_DRINKS_PER_HOUR} drinks per person per hour for a ${event.defaultDuration}-hour event.`,
    },
    {
      step: 3,
      label: 'Apply consumption decay',
      formula: `Adjusted for drinking slowdown over time (decay factor: ${consumptionMult.toFixed(2)})`,
      result: `${Math.round(actualDrinkers * BASE_DRINKS_PER_HOUR * consumptionMult)} adjusted drinks`,
      explanation: 'People drink faster in the first hour and slow down as the event progresses.',
    },
    {
      step: 4,
      label: `Apply ${event.name.toLowerCase()} modifier`,
      formula: `× ${modifier} (${modifier > 1 ? '+' : ''}${Math.round((modifier - 1) * 100)}% for ${item.name.toLowerCase()})`,
      result: `${result.totalServings} ${item.name.toLowerCase()} servings needed`,
      explanation: modifier !== 1
        ? `${event.name}s typically consume ${Math.abs(Math.round((modifier - 1) * 100))}% ${modifier > 1 ? 'more' : 'less'} ${item.name.toLowerCase()} than average.`
        : `${event.name}s have standard ${item.name.toLowerCase()} consumption.`,
    },
    {
      step: 5,
      label: `Convert to ${item.unit}`,
      formula: `${result.totalServings} servings ÷ ${item.servingsPerUnit} servings per ${item.unitSingular}`,
      result: `${result.rawUnits} ${item.unit} (raw)`,
      explanation: `Each ${item.unitSingular} of ${item.name.toLowerCase()} provides ${item.servingsPerUnit} servings.`,
    },
    {
      step: 6,
      label: 'Add 15% buffer & round up',
      formula: `${result.rawUnits} × 1.15 = ${(result.rawUnits * 1.15).toFixed(1)}, rounded up`,
      result: `${result.unitsNeeded} ${result.unitsDisplay}`,
      explanation: 'Always round up and add a buffer. Running out is worse than having leftovers!',
    },
  ];

  return steps;
}

// =============================================================================
// SHOPPING LIST GENERATOR
// =============================================================================

function generateShoppingList(
  item: Item,
  result: CalculationResult
): ShoppingItem[] {
  const list: ShoppingItem[] = [];

  // Main item
  list.push({
    name: item.name,
    quantity: result.unitsNeeded,
    unit: result.unitsDisplay,
    affiliateCategory: item.id,
  });

  // Add complementary items based on type
  if (item.id === 'wine') {
    list.push(
      { name: 'Wine opener/corkscrew', quantity: 2, unit: 'pieces', notes: 'Have a backup!' },
      { name: 'Wine glasses (or plastic)', quantity: Math.ceil(result.actualDrinkers * 2), unit: 'glasses', notes: '2 per drinker for variety' },
    );
  } else if (item.id === 'beer') {
    const poundsOfIce = Math.ceil(result.unitsNeeded * 24 * 0.5); // ~0.5 lbs ice per beer
    list.push(
      { name: 'Ice', quantity: poundsOfIce, unit: 'lbs', notes: 'Keep those beers cold!' },
      { name: 'Coolers', quantity: Math.ceil(result.unitsNeeded / 2), unit: 'coolers', notes: '2 cases per cooler' },
    );
  } else if (item.id === 'champagne') {
    list.push(
      { name: 'Champagne flutes', quantity: Math.ceil(result.actualDrinkers * 1.5), unit: 'glasses', notes: '1.5 per drinker' },
      { name: 'Ice buckets', quantity: Math.ceil(result.unitsNeeded / 4), unit: 'buckets', notes: 'Keep bottles chilled' },
    );
  } else if (item.id === 'spirits') {
    list.push(
      { name: 'Mixers (soda, tonic, juice)', quantity: Math.ceil(result.totalServings / 3), unit: 'liters', notes: 'Variety is key' },
      { name: 'Ice', quantity: Math.ceil(result.actualDrinkers * 2), unit: 'lbs', notes: '~2 lbs per person' },
      { name: 'Cocktail glasses', quantity: Math.ceil(result.actualDrinkers * 2), unit: 'glasses', notes: '2 per drinker' },
      { name: 'Garnishes (limes, lemons)', quantity: Math.ceil(result.totalServings / 8), unit: 'pieces' },
    );
  }

  return list;
}

// =============================================================================
// RELATED PAGES GENERATOR
// =============================================================================

function generateRelatedPages(
  currentItem: Item,
  currentEvent: EventType,
  currentGuestCount: GuestCount
): RelatedPage[] {
  const related: RelatedPage[] = [];

  // Same event, same guests, different items
  items.forEach(item => {
    if (item.id !== currentItem.id) {
      related.push({
        slug: `${item.id}-for-${currentEvent.slug}-${currentGuestCount.value}-guests`,
        title: `${item.name} for ${currentEvent.name} (${currentGuestCount.value} guests)`,
        relationship: 'same-event',
      });
    }
  });

  // Same item, same event, adjacent guest counts
  const currentIndex = guestCounts.findIndex(gc => gc.value === currentGuestCount.value);
  if (currentIndex > 0) {
    const prev = guestCounts[currentIndex - 1];
    related.push({
      slug: `${currentItem.id}-for-${currentEvent.slug}-${prev.value}-guests`,
      title: `${currentItem.name} for ${currentEvent.name} (${prev.value} guests)`,
      relationship: 'adjacent-guests',
    });
  }
  if (currentIndex < guestCounts.length - 1) {
    const next = guestCounts[currentIndex + 1];
    related.push({
      slug: `${currentItem.id}-for-${currentEvent.slug}-${next.value}-guests`,
      title: `${currentItem.name} for ${currentEvent.name} (${next.value} guests)`,
      relationship: 'adjacent-guests',
    });
  }

  // Same item, different events (limit to 2)
  const otherEvents = events.filter(e => e.id !== currentEvent.id).slice(0, 2);
  otherEvents.forEach(event => {
    related.push({
      slug: `${currentItem.id}-for-${event.slug}-${currentGuestCount.value}-guests`,
      title: `${currentItem.name} for ${event.name} (${currentGuestCount.value} guests)`,
      relationship: 'same-item',
    });
  });

  return related;
}

// =============================================================================
// META/SEO GENERATOR
// =============================================================================

function generateMeta(
  item: Item,
  event: EventType,
  guestCount: GuestCount,
  result: CalculationResult
): PageMeta {
  const slug = `${item.id}-for-${event.slug}-${guestCount.value}-guests`;

  return {
    title: `How Much ${item.name} for ${guestCount.value} Guest ${event.name}? | ${result.unitsNeeded} ${result.unitsDisplay}`,
    description: `Need ${item.name.toLowerCase()} for a ${guestCount.value}-person ${event.name.toLowerCase()}? You'll need exactly ${result.unitsNeeded} ${result.unitsDisplay}. Free calculator with pro tips from experienced bartenders.`,
    h1: `How Much ${item.name} for a ${guestCount.value} Guest ${event.name}?`,
    canonicalUrl: `https://stocktheevent.com/${slug}`,
  };
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

function generateAllPages(): CalculatorPage[] {
  const pages: CalculatorPage[] = [];

  for (const item of items) {
    for (const event of events) {
      for (const guestCount of guestCounts) {
        const slug = `${item.id}-for-${event.slug}-${guestCount.value}-guests`;
        const calculation = calculate(item, event, guestCount);

        const page: CalculatorPage = {
          slug,
          item,
          event,
          guestCount,
          calculation,
          meta: generateMeta(item, event, guestCount, calculation),
          mathExplanation: generateMathExplanation(item, event, guestCount, calculation),
          shoppingList: generateShoppingList(item, calculation),
          relatedPages: generateRelatedPages(item, event, guestCount),
        };

        pages.push(page);
      }
    }
  }

  return pages;
}

// =============================================================================
// FILE OUTPUT
// =============================================================================

function writeDataFiles(pages: CalculatorPage[]): void {
  const outputDir = path.join(__dirname, '../src/content/calculators');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write individual page JSON files
  for (const page of pages) {
    const filePath = path.join(outputDir, `${page.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(page, null, 2));
  }

  // Write index file with all slugs for getStaticPaths
  const indexPath = path.join(outputDir, '_index.json');
  const index = pages.map(p => ({
    slug: p.slug,
    item: p.item.id,
    event: p.event.id,
    guests: p.guestCount.value,
  }));
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  console.log(`Generated ${pages.length} calculator pages`);
  console.log(`Index file: ${indexPath}`);
}

// Run generation
const pages = generateAllPages();
writeDataFiles(pages);

// Stats
console.log('\n--- Generation Stats ---');
console.log(`Items: ${items.length}`);
console.log(`Events: ${events.length}`);
console.log(`Guest counts: ${guestCounts.length}`);
console.log(`Total pages: ${items.length * events.length * guestCounts.length}`);
