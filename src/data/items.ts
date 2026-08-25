import type { Item } from '../lib/types';

export const items: Item[] = [
  {
    id: 'wine',
    name: 'Wine',
    namePlural: 'Wine',
    icon: 'wine',
    standardPour: '5 oz glass',
    unit: 'bottles',
    unitSingular: 'bottle',
    servingsPerUnit: 5, // 5 glasses per 750ml bottle (5oz pour)
    category: 'beverage',
    subcategory: 'alcohol',
  },
  {
    id: 'beer',
    name: 'Beer',
    namePlural: 'Beer',
    icon: 'beer',
    standardPour: '12 oz can or bottle',
    unit: 'cases',
    unitSingular: 'case',
    servingsPerUnit: 24, // 24 cans per case
    category: 'beverage',
    subcategory: 'alcohol',
  },
  {
    id: 'champagne',
    name: 'Champagne',
    namePlural: 'Champagne',
    icon: 'flute',
    standardPour: '4 oz flute',
    unit: 'bottles',
    unitSingular: 'bottle',
    servingsPerUnit: 6, // 6 flutes per bottle (4oz pour)
    category: 'beverage',
    subcategory: 'alcohol',
  },
  {
    id: 'spirits',
    name: 'Spirits',
    namePlural: 'Spirits',
    icon: 'spirit',
    standardPour: '1.5 oz pour',
    unit: 'bottles',
    unitSingular: 'bottle',
    servingsPerUnit: 17, // 17 drinks per 750ml (1.5oz shots)
    category: 'beverage',
    subcategory: 'alcohol',
  },
];

export const getItemById = (id: string): Item | undefined => {
  return items.find(item => item.id === id);
};

// =============================================================================
// CHAMPAGNE TOAST
// =============================================================================

/**
 * Flutes poured per guest for a toast. Everyone gets a glass for the toast,
 * including guests who are not drinking otherwise, so this multiplies total
 * guests rather than the estimated number of drinkers.
 */
export const TOAST_FLUTES_PER_GUEST = 1;

/**
 * Flutes per bottle. Reuses the champagne item's servingsPerUnit so the pour
 * size is defined in exactly one place.
 */
export const FLUTES_PER_BOTTLE =
  items.find(item => item.id === 'champagne')!.servingsPerUnit;

/**
 * Bottles needed to give every guest one flute for the toast, with the same
 * buffer the rest of the site uses. The buffer is passed in so its value stays
 * defined by the caller rather than duplicated here.
 */
export function toastBottles(guests: number, bufferPercentage: number): number {
  const rawBottles = (guests * TOAST_FLUTES_PER_GUEST) / FLUTES_PER_BOTTLE;
  return Math.ceil(rawBottles * (1 + bufferPercentage));
}
