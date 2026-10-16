/**
 * index.ts - counts derived from the page data.
 *
 * Nothing here is hardcoded. If a drink, food, event, or guest count is added,
 * every number the site quotes moves with it.
 */

import { items } from './items';
import { foodItems } from './foodItems';
import { events } from './events';

/** Drink calculator pages: one per drink and event. */
export function drinkCalculators(): number {
  return items.length * events.length;
}

/** Food calculator pages: one per food and event. */
export function foodCalculators(): number {
  return foodItems.length * events.length;
}

/** Bar setup pages: one per event. */
export function barSetupCalculators(): number {
  return events.length;
}

/** Every generated calculator page. */
export function totalCalculators(): number {
  return drinkCalculators() + foodCalculators() + barSetupCalculators();
}

/** Same count, formatted for display (for example "143"). */
export function totalCalculatorsLabel(): string {
  return totalCalculators().toLocaleString('en-US');
}
