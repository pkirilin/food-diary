import type { UserConfig as VitestUserConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

declare module 'vite' {
  export interface UserConfig {
    test: VitestUserConfig['test'];
  }
}

export default defineConfig({
  plugins: [react()],

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
