// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  base: '/bigquery-dashboard-connector',
  output: 'server',
  adapter: cloudflare({
    mode: 'advanced',
    imageService: 'compile',
  }),
  integrations: [react()],
  vite: {
    ssr: {
      external: ['node:async_hooks'],
    },
  },
});


