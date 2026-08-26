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
 * Who publishes this site. Used for the Person schema and the AuthorBlock
 * component (homepage, methodology page, About page).
 *
 * Two bios, because one of them is read out of the page's context and the
 * other is not: `bio` is fully named ("Stock the Event") and portable, for
 * the Person schema description, which can surface in rich results or an AI
 * summary far from this page. `bioOnSite` refers to this site as "this
 * site" instead, since AuthorBlock only ever renders it in place, on a page
 * that already is this site.
 *
 * Both bios state only what the sites themselves demonstrate. They claim no
 * years of experience, no hospitality credential, and no professional
 * bartending or catering background, because none of those are established
 * anywhere.
 */
export const AUTHOR = {
  name: 'Zachary Pearson',
  role: 'Stock the Event and Freezer Batch Cocktails',
  /** Fully named, third person. Used only for the Person schema description. */
  bio:
    'Zachary Pearson and his wife Katie love to host, but hate the hassle of mixing individual drinks all night ' +
    'and guessing shopping quantities. To solve this, Zachary built Stock the Event (stocktheevent.com) and ' +
    'Freezer Batch Cocktails (freezerbatchcocktails.com). These calculators turn a guest count, an occasion, and ' +
    'a run time into a shopping list. The entire math model is public, letting anyone double-check the numbers ' +
    'or adjust them for their own gatherings.',
  /** Third person, refers to this site as "this site". AuthorBlock's default for on-page display. */
  bioOnSite:
    'Zachary Pearson and his wife Katie love to host, but hate the hassle of mixing individual drinks all night ' +
    'and guessing shopping quantities. To solve this, Zachary built this site and its sister site, Freezer Batch ' +
    'Cocktails (freezerbatchcocktails.com). These calculators turn a guest count, an occasion, and a run time ' +
    'into a shopping list. The entire math model is public, letting anyone double-check the numbers or adjust ' +
    'them for their own gatherings.',
  /**
   * The two sites Zachary publishes. sameAs always links both. AuthorBlock
   * links whichever of these names actually appear in the bio text it is
   * given - only "Freezer Batch Cocktails" appears in bioOnSite and the
   * About page's first-person bio, so those render one link, not two.
   */
  sites: [
    { name: 'Stock the Event', url: 'https://www.stocktheevent.com/' },
    { name: 'Freezer Batch Cocktails', url: 'https://freezerbatchcocktails.com/' },
  ],
  /** Social and professional profiles, added here when there are any to link. */
  links: [] as string[],
};
