import { expect, test } from '@playwright/test';

test('should display google search page', async ({ page }) => {
  await page.goto('https://www.google.com/');
  await expect(page.getByRole('img', { name: 'Google' })).toBeVisible();
});
