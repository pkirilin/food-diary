import { test, expect } from '@playwright/test';
import { FakeAuthProvider } from '../fakeAuth';

let fakeAuth: FakeAuthProvider | null = null;

test.beforeEach(async () => {
  fakeAuth = new FakeAuthProvider();
  await fakeAuth.setup();
});

test.afterEach(async () => {
  await fakeAuth?.teardown();
});

test('should display sign in page', async ({ page }) => {
  await page.goto('https://localhost:8080');

  await page.getByRole('button', { name: /sign in with google/i }).click();

  await expect(page.getByText(/hello world/i)).toBeVisible();
});
