import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind'; // <-- Add this

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
  }),
  integrations:[react()],
  vite: {
    optimizeDeps: {
      // Disable dependency discovery to prevent Vite from crawling 
      // into problematic packages during the build phase.
      noDiscovery: true,
      include: [],
      exclude: [
        'lightningcss',
        'blake3-wasm',
        '@babel/core',
        '@babel/preset-typescript'
      ],
    },
    build: {
      // Explicitly use esbuild for CSS minification to avoid 
      // triggering lightningcss resolution issues.
      cssMinify: 'esbuild',
      rollupOptions: {
        external: [
          'lightningcss',
          'blake3-wasm',
          '@babel/core',
          '@babel/preset-typescript'
        ],
      },
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      }
    },
    ssr: {
      external: [
        'lightningcss',
        '@babel/core',
        'blake3-wasm',
        '@babel/preset-typescript'
      ],
      noExternal: ['@astrojs/react'],
    },
  },
});