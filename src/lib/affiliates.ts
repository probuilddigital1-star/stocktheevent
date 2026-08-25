import { retailers, retailerUrl } from './retailers';

const AMAZON_TAG = 'probuild20-20';

export interface AffiliateProduct {
  name: string;
  /** Amazon ASIN. "ASIN_TODO" is a placeholder; see the comment on each entry
   * for the product it should become, and the link falls back to a search
   * URL until a real ASIN replaces it. */
  asin: string;
  /** One line explaining why this belongs on the list. Rendered in --ink-2. */
  why: string;
  /** Units per pack, when the product is commonly sold in packs. */
  packSize?: number;
  packUnit?: string;
  category: 'drink' | 'food';
  /** Amazon search terms used while asin is still a placeholder. */
  searchQuery: string;
}

export const affiliateCatalog: Record<string, AffiliateProduct> = {
  // Drink accessories
  corkscrew: {
    name: 'Wine Opener',
    asin: 'ASIN_TODO', // double-hinged waiter's corkscrew, 2-pack
    why: 'A backup means one stuck cork does not stall the bar.',
    category: 'drink',
    searchQuery: 'wine corkscrew',
  },
  'wine-glasses': {
    name: 'Wine Glasses, Plastic',
    asin: 'ASIN_TODO', // 72-pack 12 oz clear plastic wine glasses
    why: 'Two per drinker covers a refill without a trip to the sink.',
    packSize: 72,
    packUnit: 'glasses',
    category: 'drink',
    searchQuery: 'wine glasses party',
  },
  'champagne-flutes': {
    name: 'Champagne Flutes, Plastic',
    asin: 'ASIN_TODO', // 24-pack 4 oz plastic champagne flutes
    why: 'One per guest for the toast, no washing up after.',
    packSize: 24,
    packUnit: 'flutes',
    category: 'drink',
    searchQuery: 'champagne flutes plastic',
  },
  'cocktail-glasses': {
    name: 'Cocktail Glasses, Plastic',
    asin: 'ASIN_TODO', // 24-pack 9 oz plastic cocktail glasses
    why: 'Two per drinker keeps a fresh glass in hand between rounds.',
    packSize: 24,
    packUnit: 'glasses',
    category: 'drink',
    searchQuery: 'plastic cocktail glasses party',
  },
  'ice-bucket': {
    name: 'Ice Bucket',
    asin: 'ASIN_TODO', // double-wall insulated ice bucket with tongs
    why: 'Keeps a bottle at the ready without a trip back to the cooler.',
    category: 'drink',
    searchQuery: 'ice bucket party',
  },
  cooler: {
    name: 'Rolling Beverage Cooler',
    asin: 'ASIN_TODO', // 75-quart wheeled cooler
    why: 'Wheels it where the crowd is instead of the crowd finding it.',
    category: 'drink',
    searchQuery: 'beverage cooler party',
  },
  'cocktail-shaker': {
    name: 'Cocktail Shaker Set',
    asin: 'ASIN_TODO', // cocktail shaker set with jigger and strainer
    why: 'Everything needed to mix drinks to order, not just pour them.',
    category: 'drink',
    searchQuery: 'cocktail shaker set',
  },
  'party-cups': {
    name: 'Party Cups',
    asin: 'ASIN_TODO', // 100-pack 16 oz plastic party cups
    why: 'The default cup for beer, soda, and everything in between.',
    packSize: 100,
    packUnit: 'cups',
    category: 'drink',
    searchQuery: 'party cups plastic',
  },
  'bar-tools': {
    name: 'Bartender Kit',
    asin: 'ASIN_TODO', // bartender kit with stand, jigger, muddler, strainer
    why: 'Jigger, muddler, and strainer in one set covers most cocktails.',
    category: 'drink',
    searchQuery: 'bartender kit',
  },

  // Food accessories
  napkins: {
    name: 'Cocktail Napkins',
    asin: 'ASIN_TODO', // 200-pack cocktail napkins
    why: 'Cheap, and the first thing a bar runs out of.',
    packSize: 200,
    packUnit: 'napkins',
    category: 'food',
    searchQuery: 'cocktail napkins',
  },
  'paper-plates': {
    name: 'Paper Plates',
    asin: 'ASIN_TODO', // 100-pack heavy duty paper plates
    why: 'Sturdy enough for a full plate, gone at the end of the night.',
    packSize: 100,
    packUnit: 'plates',
    category: 'food',
    searchQuery: 'paper plates heavy duty',
  },
  'serving-platters': {
    name: 'Serving Platters',
    asin: 'ASIN_TODO', // set of 4 disposable serving platters
    why: 'Keeps the spread looking intentional instead of straight from the box.',
    category: 'food',
    searchQuery: 'serving platters party',
  },
  'warming-tray': {
    name: 'Warming Tray',
    asin: 'ASIN_TODO', // electric buffet warming tray
    why: 'Keeps the last batch as hot as the first.',
    category: 'food',
    searchQuery: 'warming tray party',
  },
};

function toAmazonSearchUrl(query: string): string {
  return `https://www.amazon.com/s?k=${query.split(' ').join('+')}&tag=${AMAZON_TAG}`;
}

/** Builds the buy link for a catalog key: a real product page once it has an
 * ASIN, a search fallback while it is still "ASIN_TODO". */
export function urlFor(key: string): string {
  const product = affiliateCatalog[key];
  if (!product) return '#';
  if (product.asin && product.asin !== 'ASIN_TODO') {
    return `https://www.amazon.com/dp/${product.asin}?tag=${AMAZON_TAG}`;
  }
  return toAmazonSearchUrl(product.searchQuery);
}

/** Resolves a shopping-list row's affiliate destination from its category.
 * "ice" is a special case: it is not shippable, so it routes to Instacart's
 * bag ice when that retailer is enabled, or returns null for a plain note. */
export function getAffiliateLink(item: { affiliateCategory?: string }): string | null {
  if (!item.affiliateCategory) return null;
  if (item.affiliateCategory === 'ice') {
    const instacart = retailers.find((r) => r.id === 'instacart');
    if (instacart?.enabled) {
      return retailerUrl(instacart, 'bag ice');
    }
    return null;
  }
  return affiliateCatalog[item.affiliateCategory] ? urlFor(item.affiliateCategory) : null;
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/** "140 glasses: two 72-packs" - how many packs of a known pack size covers a
 * needed quantity, spelled out for small counts. */
export function packMathSentence(quantity: number, unit: string, packSize: number, packUnit: string): string {
  const packs = Math.ceil(quantity / packSize);
  const packsWord = packs <= 10 ? NUMBER_WORDS[packs] : String(packs);
  const packNoun = packs === 1 ? 'pack' : 'packs';
  return `${quantity} ${unit}: ${packsWord} ${packSize}-${packNoun}`;
}
