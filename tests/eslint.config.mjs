import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import playwright from 'eslint-plugin-playwright';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['.yarn', 'playwright.config.ts', 'playwright-report', 'test-results']),

  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      'no-console': 'warn',
    },
  },

  {
    files: ['**/*.spec.ts'],
    extends: [playwright.configs['flat/recommended']],
  },

  prettierRecommended,
]);
