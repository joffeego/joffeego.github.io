// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://joffee.eu.org',
  integrations: [sitemap()],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
