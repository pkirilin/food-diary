import { test, expect } from '@playwright/test';

test('should display sign in page', async ({ page }) => {
  await page.goto('https://localhost:10000');

  await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
});
