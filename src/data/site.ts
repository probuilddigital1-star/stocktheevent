/**
 * site.ts - site-wide constants that are not derived from other data.
 */

/**
 * The date page content or the calculation model last changed, as an ISO date.
 * Used for sitemap lastmod so the value only moves when content actually moves,
 * rather than on every build. Bump this whenever page copy or the calculation
 * model changes.
 */
export const CONTENT_UPDATED = '2026-08-26';

/**
 * Who publishes this site. Used for the Person schema on the About page and the
 * author block on the methodology page.
 *
 * The bio states only what the site itself demonstrates. It claims no years of
 * experience, no hospitality credential, and no professional bartending or
 * catering background, because none of those are established anywhere.
 */
export const AUTHOR = {
  name: 'Zachary Pearson',
  role: 'Founder, ProBuild Digital',
  bio:
    'Zachary Pearson built StockTheEvent, a set of free calculators that turn a guest count, ' +
    'an event type, and a run time into a shopping list. The full calculation model is published ' +
    'so anyone can check the numbers or adjust them for their own party.',
  /** Social and professional profiles, added here when there are any to link. */
  links: [] as string[],
};
