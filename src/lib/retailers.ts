/**
 * retailers.ts - the "Where to buy" retailer catalog.
 *
 * Every retailer starts disabled until real partner links exist; enabling one
 * is a one-line flip once that link is in hand. WhereToBuy.astro renders the
 * enabled subset for a given drink, and falls back to a plain "find it
 * locally" line when none are enabled.
 */

export interface Retailer {
  id: string;
  name: string;
  blurb: string;
  /** Search URL with a `{query}` placeholder for the encoded search term. */
  urlTemplate: string;
  enabled: boolean;
  /** Drink ids (from src/data/items.ts) this retailer is shown for. */
  appliesTo: string[];
}

export const retailers: Retailer[] = [
  {
    id: 'total-wine',
    name: 'Total Wine',
    blurb: 'Case pricing, pickup today',
    urlTemplate: 'https://www.totalwine.com/search/all?text={query}',
    enabled: false,
    appliesTo: ['wine', 'beer', 'champagne', 'spirits'],
  },
  {
    id: 'instacart',
    name: 'Instacart',
    blurb: 'Same-day delivery, ice and glasses too',
    urlTemplate: 'https://www.instacart.com/store/search/{query}',
    enabled: false,
    appliesTo: ['wine', 'beer', 'champagne', 'spirits'],
  },
  {
    id: 'reservebar',
    name: 'ReserveBar',
    blurb: 'Premium spirits and champagne, shipped',
    urlTemplate: 'https://www.reservebar.com/search?q={query}',
    enabled: false,
    appliesTo: ['spirits', 'champagne'],
  },
];

export function getRetailer(id: string): Retailer | undefined {
  return retailers.find((r) => r.id === id);
}

/** Fills a retailer's {query} placeholder with an encoded search term. */
export function retailerUrl(retailer: Retailer, query: string): string {
  return retailer.urlTemplate.replace('{query}', encodeURIComponent(query));
}
