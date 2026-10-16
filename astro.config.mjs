// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

import { CONTENT_UPDATED } from './src/data/site.ts';

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
      !page.includes('/embed/'),
    // Fixed date, not new Date(), so lastmod only moves when content moves.
    lastmod: new Date(CONTENT_UPDATED),
  })]
});
