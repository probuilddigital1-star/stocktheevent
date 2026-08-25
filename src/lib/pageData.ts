/**
 * pageData.ts - build-time access to the generated calculator JSON.
 *
 * Hub pages must show the same number the page they link to shows, so they read
 * the generated data rather than recomputing anything. Every drink figure is the
 * fullBar quantity; every food figure is the primary quantity.
 *
 * The files are read once per build and cached at module scope. Before this
 * existed, each of the 17 hubs parsed all 728 drink files on its own, roughly
 * 12,400 parses per build; adding food hubs and a bar-setup index the same way
 * would have made that far worse.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { CalculatorPage, FoodCalculatorPage } from './types';

const CALCULATORS_DIR = path.join(process.cwd(), 'src/content/calculators');
const FOOD_CALCULATORS_DIR = path.join(process.cwd(), 'src/content/food-calculators');

function loadDir<T>(dir: string): Map<string, T> {
  const map = new Map<string, T>();
  if (!fs.existsSync(dir)) return map;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json') || file.startsWith('_')) continue;
    map.set(file.replace('.json', ''), JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')));
  }
  return map;
}

let drinkCache: Map<string, CalculatorPage> | null = null;
let foodCache: Map<string, FoodCalculatorPage> | null = null;

function drinkPages(): Map<string, CalculatorPage> {
  if (!drinkCache) drinkCache = loadDir<CalculatorPage>(CALCULATORS_DIR);
  return drinkCache;
}

function foodPages(): Map<string, FoodCalculatorPage> {
  if (!foodCache) foodCache = loadDir<FoodCalculatorPage>(FOOD_CALCULATORS_DIR);
  return foodCache;
}

export function slugFor(itemId: string, eventSlug: string, guests: number): string {
  return `${itemId}-for-${eventSlug}-${guests}-guests`;
}

/** A generated drink page, or null when that combination was never generated. */
export function drinkPage(itemId: string, eventSlug: string, guests: number): CalculatorPage | null {
  return drinkPages().get(slugFor(itemId, eventSlug, guests)) ?? null;
}

/** A generated food page, or null when that combination was never generated. */
export function foodPage(itemId: string, eventSlug: string, guests: number): FoodCalculatorPage | null {
  return foodPages().get(slugFor(itemId, eventSlug, guests)) ?? null;
}

export interface FullBarTotals {
  /** Units to buy across all four drinks. */
  units: number;
  /** Servings across all four drinks. */
  servings: number;
}

/**
 * The whole bar for one event and guest count, summed from the four generated
 * fullBar figures. This is an aggregate of generated data, not a re-run of the
 * model, so it agrees with the bar-setup page by construction.
 * Returns null if any of the four drink pages is missing.
 */
export function fullBarTotals(drinkIds: string[], eventSlug: string, guests: number): FullBarTotals | null {
  let units = 0;
  let servings = 0;
  for (const id of drinkIds) {
    const page = drinkPage(id, eventSlug, guests);
    if (!page) return null;
    units += page.calculation.fullBar.unitsNeeded;
    servings += page.calculation.fullBar.totalServings;
  }
  return { units, servings };
}
