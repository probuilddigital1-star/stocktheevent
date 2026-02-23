// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.stocktheevent.com',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [sitemap({
    filter: (page) =>
      !page.includes('/privacy') &&
      !page.includes('/terms') &&
      !page.includes('/unsubscribe') &&
      !page.includes('/404')
  })]
});