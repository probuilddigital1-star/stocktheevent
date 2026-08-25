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
  DrinkQuantity,
  MathStep,
  ShoppingItem,
  RelatedPage,
  PageMeta,
  CalculatorPage
} from '../src/lib/types';
import { items, toastBottles } from '../src/data/items';
import { events } from '../src/data/events';
import { guestCounts } from '../src/data/guestCounts';
import { drinkShare, formatSharePercent } from '../src/data/eventSplits';
import {
  BASE_DRINKS_PER_HOUR,
  BUFFER_PERCENTAGE,
  DRINKING_PERCENTAGE,
  consumptionMultiplier as calculateConsumptionMultiplier,
} from '../src/data/model';

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

/** Resolve a servings figure into the units to buy, with the buffer applied. */
function toQuantity(totalServings: number, item: Item, guests: number): DrinkQuantity {
  const rawUnits = totalServings / item.servingsPerUnit;
  const unitsNeeded = calculateUnitsNeeded(totalServings, item.servingsPerUnit);
  const buffer = unitsNeeded - Math.ceil(rawUnits);

  return {
    totalServings,
    unitsNeeded,
    unitsDisplay: unitsNeeded === 1 ? item.unitSingular : item.unit,
    perPersonServings: Math.round((totalServings / guests) * 10) / 10,
    buffer,
    rawUnits: Math.round(rawUnits * 10) / 10,
  };
}

function calculate(
  item: Item,
  event: EventType,
  guestCount: GuestCount
): CalculationResult {
  const modifier = event.modifiers[item.id] || 1.0;
  const drinkingPercentage = DRINKING_PERCENTAGE[guestCount.tier];
  const actualDrinkers = Math.round(guestCount.value * drinkingPercentage);

  // What you need if this drink is the only alcohol at the party.
  const onlyDrinkServings = calculateServings(
    guestCount.value,
    guestCount.tier,
    event.defaultDuration,
    modifier
  );

  // What you need when this drink is one of four on a full bar. Total drinks are
  // fixed by guests and duration; the share only divides them.
  const barShare = drinkShare(event.id, item.id);
  const fullBarServings = Math.round(onlyDrinkServings * barShare);

  const onlyDrink = toQuantity(onlyDrinkServings, item, guestCount.value);
  const fullBar = toQuantity(fullBarServings, item, guestCount.value);

  return {
    // The full bar answer is the primary one, so it sits at the top level where
    // every existing consumer already reads from.
    ...fullBar,
    actualDrinkers,
    fullBar,
    onlyDrink,
    barShare,
    ...(item.id === 'champagne'
      ? { toastBottles: toastBottles(guestCount.value, BUFFER_PERCENTAGE) }
      : {}),
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
  const sharePercent = formatSharePercent(result.barShare);

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
      label: `Apply ${event.lowerName} modifier`,
      formula: `× ${modifier} (${modifier > 1 ? '+' : ''}${Math.round((modifier - 1) * 100)}% for ${item.name.toLowerCase()})`,
      result: `${result.onlyDrink.totalServings} ${item.name.toLowerCase()} servings if served alone`,
      explanation: modifier !== 1
        ? `${event.pluralName} typically consume ${Math.abs(Math.round((modifier - 1) * 100))}% ${modifier > 1 ? 'more' : 'less'} ${item.name.toLowerCase()} than average.`
        : `${event.pluralName} have standard ${item.name.toLowerCase()} consumption.`,
    },
    {
      step: 5,
      label: 'Share of the bar',
      formula: `${result.onlyDrink.totalServings} servings × ${sharePercent}%`,
      result: `${result.fullBar.totalServings} ${item.name.toLowerCase()} servings`,
      explanation: `Share of the bar: ${sharePercent} percent of drinks at a ${event.lowerName} are ${item.name.toLowerCase()}. The rest of the bar covers the other drinks.`,
    },
    {
      step: 6,
      label: `Convert to ${item.unit}`,
      formula: `${result.fullBar.totalServings} servings ÷ ${item.servingsPerUnit} servings per ${item.unitSingular}`,
      result: `${result.fullBar.rawUnits} ${item.unit} (raw)`,
      explanation: `Each ${item.unitSingular} of ${item.name.toLowerCase()} provides ${item.servingsPerUnit} servings.`,
    },
    {
      step: 7,
      label: 'Add 15% buffer & round up',
      formula: `${result.fullBar.rawUnits} × 1.15 = ${(result.fullBar.rawUnits * 1.15).toFixed(1)}, rounded up`,
      result: `${result.fullBar.unitsNeeded} ${result.fullBar.unitsDisplay}`,
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
      { name: 'Wine opener/corkscrew', quantity: 2, unit: 'pieces', notes: 'Have a backup!', affiliateCategory: 'corkscrew' },
      { name: 'Wine glasses (or plastic)', quantity: Math.ceil(result.actualDrinkers * 2), unit: 'glasses', notes: '2 per drinker for variety', affiliateCategory: 'wine-glasses' },
    );
  } else if (item.id === 'beer') {
    const poundsOfIce = Math.ceil(result.unitsNeeded * 24 * 0.5); // ~0.5 lbs ice per beer
    list.push(
      { name: 'Ice', quantity: poundsOfIce, unit: 'lbs', notes: 'Keep those beers cold!', affiliateCategory: 'ice' },
      { name: 'Coolers', quantity: Math.ceil(result.unitsNeeded / 2), unit: 'coolers', notes: '2 cases per cooler', affiliateCategory: 'cooler' },
    );
  } else if (item.id === 'champagne') {
    list.push(
      { name: 'Champagne flutes', quantity: Math.ceil(result.actualDrinkers * 1.5), unit: 'glasses', notes: '1.5 per drinker', affiliateCategory: 'champagne-flutes' },
      { name: 'Ice buckets', quantity: Math.ceil(result.unitsNeeded / 4), unit: 'buckets', notes: 'Keep bottles chilled', affiliateCategory: 'ice-bucket' },
    );
  } else if (item.id === 'spirits') {
    list.push(
      { name: 'Mixers (soda, tonic, juice)', quantity: Math.ceil(result.totalServings / 3), unit: 'liters', notes: 'Variety is key' },
      { name: 'Ice', quantity: Math.ceil(result.actualDrinkers * 2), unit: 'lbs', notes: '~2 lbs per person', affiliateCategory: 'ice' },
      { name: 'Cocktail glasses', quantity: Math.ceil(result.actualDrinkers * 2), unit: 'glasses', notes: '2 per drinker', affiliateCategory: 'cocktail-glasses' },
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
  const drink = item.name.toLowerCase();
  const eventName = event.lowerName;
  const fullBar = result.fullBar;
  const onlyDrink = result.onlyDrink;

  const toastSentence = result.toastBottles
    ? ` For the toast alone, ${result.toastBottles} bottles.`
    : '';

  return {
    title: `How Much ${item.name} for a ${guestCount.value}-Guest ${event.name}? | ${fullBar.unitsNeeded} ${fullBar.unitsDisplay}`,
    description: `Need ${drink} for a ${guestCount.value}-guest ${eventName}? Plan on ${fullBar.unitsNeeded} ${fullBar.unitsDisplay} as part of a full bar, or ${onlyDrink.unitsNeeded} ${onlyDrink.unitsDisplay} if ${drink} is the only alcohol you serve.${toastSentence}`,
    h1: `How Much ${item.name} for a ${guestCount.value}-Guest ${event.name}?`,
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

  console.log(`Generated ${pages.length} calculator pages`);
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
