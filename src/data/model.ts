/**
 * model.ts - the consumption model constants, in one place.
 *
 * These were previously copy-pasted into scripts/generateData.ts,
 * scripts/generateFoodData.ts, src/pages/[slug].astro,
 * src/pages/bar-setup/[...slug].astro and src/components/InteractiveCalculator.astro,
 * and the copies had already drifted: the generator carried a five-entry
 * HOURLY_DECAY while every other copy carried six. Generated pages only ever use
 * event.defaultDuration, which tops out at 5 hours, so the two agreed in practice,
 * but nothing kept them that way.
 *
 * src/pages/methodology.astro reads this module directly, so the published
 * explanation of the math cannot drift from the math.
 *
 * Client-side scripts receive these through define:vars rather than redeclaring
 * them.
 */

/** Drinks an active drinker gets through per hour, before any adjustment. */
export const BASE_DRINKS_PER_HOUR = 1.5;

/** Safety margin added to every final quantity before rounding up. */
export const BUFFER_PERCENTAGE = 0.15;

/**
 * Consumption decay. People drink fastest in the first hour and slow down.
 * Index 0 is hour one; the last entry repeats for every hour beyond the list.
 */
export const HOURLY_DECAY = [1.0, 0.9, 0.75, 0.6, 0.5, 0.45];

/**
 * Share of guests who actually drink alcohol, by guest-count tier. Larger events
 * skew toward a lower share.
 */
export const DRINKING_PERCENTAGE: Record<string, number> = {
  small: 0.80,   // 10 to 30 guests
  medium: 0.75,  // 40 to 75 guests
  large: 0.70,   // 100 to 150 guests
  xlarge: 0.65,  // 200 or more guests
};

/**
 * Share of guests who eat a full serving, by guest-count tier. Runs higher than
 * the drinking rate because nearly everyone eats something.
 */
export const EATING_PERCENTAGE: Record<string, number> = {
  small: 0.95,   // 10 to 30 guests
  medium: 0.90,  // 40 to 75 guests
  large: 0.85,   // 100 to 150 guests
  xlarge: 0.80,  // 200 or more guests
};

/**
 * Total drink-hours for an event of this length, with the decay curve applied.
 * A 5-hour event yields 3.75, not 5.
 */
export function consumptionMultiplier(durationHours: number): number {
  let total = 0;
  for (let hour = 0; hour < durationHours; hour++) {
    total += HOURLY_DECAY[Math.min(hour, HOURLY_DECAY.length - 1)];
  }
  return total;
}
