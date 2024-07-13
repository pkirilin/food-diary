import 'vitest/config';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA as pwa } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    pwa({
      strategies: 'injectManifest',
      srcDir: 'src/app',
      filename: 'serviceWorker.ts',
      manifest: {
        name: 'Food Diary',
        short_name: 'Food Diary',
        icons: [
          {
            src: '/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/logo-maskable.svg',
            sizes: '192x192 512x512',
            purpose: 'maskable',
          },
        ],
        theme_color: '#43a047',
        background_color: '#ffffff',
        display: 'standalone',
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\/v1\/auth/, /^\/signin-google/],
      },
    }),
  ],

  resolve: {
    alias: {
      src: new URL('./src/', import.meta.url).pathname,
      tests: new URL('./tests/', import.meta.url).pathname,
      '@/': new URL('./src/', import.meta.url).pathname,
      '@tests/': new URL('./tests/', import.meta.url).pathname,
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: true,
  },
});
