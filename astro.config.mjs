// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import { INDEXABLE_GUEST_COUNTS } from './src/data/indexing.ts';
import { CONTENT_UPDATED } from './src/data/site.ts';

function hasIndexableGuestCount(page) {
  const match = page.match(/-(\d+)-guests\/?$/);
  if (!match) return true;
  return INDEXABLE_GUEST_COUNTS.includes(Number(match[1]));
}

// https://astro.build/config
export default defineConfig({
  site: 'https://www.stocktheevent.com',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap({
    filter: (page) =>
      !page.includes('/privacy') &&
      !page.includes('/terms') &&
      !page.includes('/unsubscribe') &&
      !page.includes('/404') &&
      hasIndexableGuestCount(page),
    // Fixed date, not new Date(), so lastmod only moves when content moves.
    lastmod: new Date(CONTENT_UPDATED),
  })]
});
