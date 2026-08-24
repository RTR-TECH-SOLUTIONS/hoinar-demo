// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Demoul stă pe GitHub Pages, într-un subfolder. `base` face ca toate
  // linkurile construite prin lib/i18n să primească prefixul corect.
  site: 'https://rtr-tech-solutions.github.io',
  base: '/hoinar-demo',
  integrations: [react()],
  devToolbar: { enabled: false },
  i18n: {
    defaultLocale: 'ro',
    locales: ['ro', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
