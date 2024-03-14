import type { UserConfig as VitestUserConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA as pwa } from 'vite-plugin-pwa';

declare module 'vite' {
  export interface UserConfig {
    test: VitestUserConfig['test'];
  }
}

export default defineConfig({
  plugins: [
    react(),
    pwa({
      registerType: 'autoUpdate',
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
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
