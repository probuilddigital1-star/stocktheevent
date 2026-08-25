/**
 * eventSplits.ts - how a bar divides across the four drinks.
 *
 * This is the single source of truth for drink splits. It is imported by
 * scripts/generateData.ts, src/components/InteractiveCalculator.astro, and
 * src/pages/bar-setup/[...slug].astro so the three cannot drift apart.
 *
 * Total drinks are fixed by guest count and duration. A split only divides that
 * total between the drinks on offer, it never grows it.
 */

import { items } from './items';

export type DrinkSplit = Record<string, number>;

/** Every drink id, in data order. */
export const DRINK_IDS: string[] = items.map((item) => item.id);

/**
 * Raw weights per event. These do not sum to 1; drinkShare normalizes them over
 * whichever drinks are actually being served.
 */
export const EVENT_SPLITS: Record<string, DrinkSplit> = {
  wedding: { wine: 0.45, beer: 0.30, champagne: 0.20, spirits: 0.25 },
  'super-bowl': { wine: 0.15, beer: 0.70, champagne: 0.05, spirits: 0.25 },
  corporate: { wine: 0.45, beer: 0.30, champagne: 0.15, spirits: 0.25 },
  birthday: { wine: 0.22, beer: 0.55, champagne: 0.08, spirits: 0.30 },
  'holiday-party': { wine: 0.40, beer: 0.20, champagne: 0.15, spirits: 0.40 },
  graduation: { wine: 0.28, beer: 0.50, champagne: 0.12, spirits: 0.25 },
  'wedding-shower': { wine: 0.40, beer: 0.08, champagne: 0.60, spirits: 0.10 },
  'march-madness': { wine: 0.15, beer: 0.65, champagne: 0.05, spirits: 0.30 },
  'fourth-of-july': { wine: 0.10, beer: 0.65, champagne: 0.05, spirits: 0.35 },
  'labor-day': { wine: 0.15, beer: 0.60, champagne: 0.05, spirits: 0.35 },
  halloween: { wine: 0.20, beer: 0.35, champagne: 0.10, spirits: 0.50 },
  thanksgiving: { wine: 0.45, beer: 0.30, champagne: 0.10, spirits: 0.30 },
  'new-years-eve': { wine: 0.25, beer: 0.15, champagne: 0.50, spirits: 0.25 },
  brunch: { wine: 0.30, beer: 0.10, champagne: 0.50, spirits: 0.20 },
};

const EVEN_SPLIT: DrinkSplit = { wine: 0.25, beer: 0.25, champagne: 0.25, spirits: 0.25 };

const warnedEventIds = new Set<string>();

/**
 * Look up an event's split. Unknown ids fall back to an even split and warn once
 * during the build, so a missing entry is visible rather than silently rendering
 * some other event's bar.
 */
export function splitsForEvent(eventId: string): DrinkSplit {
  const splits = EVENT_SPLITS[eventId];
  if (splits) return splits;

  if (!warnedEventIds.has(eventId)) {
    warnedEventIds.add(eventId);
    console.warn(
      `[eventSplits] No drink split defined for event "${eventId}". Falling back to an even split. ` +
        'Add an entry to EVENT_SPLITS in src/data/eventSplits.ts.',
    );
  }
  return EVEN_SPLIT;
}

/**
 * This drink's share of the bar, normalized over the drinks being served.
 * Defaults to all four drinks, which is the full-bar case used by the
 * single-drink calculator pages. Serving one drink gives it a share of 1.
 */
export function drinkShare(eventId: string, itemId: string, selectedIds: string[] = DRINK_IDS): number {
  const splits = splitsForEvent(eventId);
  const total = selectedIds.reduce((sum, id) => sum + (splits[id] ?? 0), 0);
  if (total <= 0) return 0;
  return (splits[itemId] ?? 0) / total;
}

/**
 * The varieties a credible selection of each drink needs. One label of champagne
 * is fine, so champagne carries an empty list and never produces a note.
 */
export const DRINK_VARIETIES: Record<string, string[]> = {
  wine: ['a red', 'a white'],
  beer: ['a light lager', 'an ale or IPA'],
  champagne: [],
  spirits: ['vodka', 'gin', 'whiskey', 'rum', 'tequila'],
};

function formatList(values: string[]): string {
  if (values.length <= 1) return values[0] ?? '';
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
}

/**
 * A note for bar setups where the computed count is below the number of varieties
 * worth having. Returns null when the count already covers the varieties, or when
 * the drink has no variety requirement.
 */
export function varietyNote(
  item: { id: string; name: string; unitSingular: string },
  unitsNeeded: number,
): string | null {
  const varieties = DRINK_VARIETIES[item.id] ?? [];
  if (varieties.length === 0 || unitsNeeded >= varieties.length) return null;
  return `For a proper ${item.name.toLowerCase()} selection, that is at least one ${item.unitSingular} each of ${formatList(varieties)}.`;
}
