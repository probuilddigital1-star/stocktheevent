/**
 * index.ts - counts derived from the page data.
 *
 * Nothing here is hardcoded. If a drink, food, event, or guest count is added,
 * every number the site quotes moves with it.
 */

import { items } from './items';
import { foodItems } from './foodItems';
import { events } from './events';
import { guestCounts } from './guestCounts';

/** Drink calculator pages: one per drink, event, and guest count. */
export function drinkCalculators(): number {
  return items.length * events.length * guestCounts.length;
}

/** Food calculator pages: one per food, event, and guest count. */
export function foodCalculators(): number {
  return foodItems.length * events.length * guestCounts.length;
}

/** Bar setup pages: one per event and guest count. */
export function barSetupCalculators(): number {
  return events.length * guestCounts.length;
}

/**
 * Every generated calculator page, indexable and noindexed alike.
 */
export function totalCalculators(): number {
  return drinkCalculators() + foodCalculators() + barSetupCalculators();
}

/** Same count, formatted for display (for example "2,002"). */
export function totalCalculatorsLabel(): string {
  return totalCalculators().toLocaleString('en-US');
}
