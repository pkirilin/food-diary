import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as IndexPage from '@/pages/ui/IndexPage';
import { AUTH_CHECK_INTERVAL } from '@/shared/config';
import { renderRoute } from '@tests/render';

test('user can login and logout', async () => {
  renderRoute(IndexPage);
  const user = userEvent.setup();

  const signInButton = await screen.findByRole('button', { name: /sign in/i });
  await user.click(signInButton);
  expect(await screen.findByRole('navigation')).toBeVisible();
  expect(await screen.findByRole('heading', { name: /19 oct 2023/i })).toBeVisible();

  const logoutButton = await screen.findByRole('button', { name: /logout/i });
  await user.click(logoutButton);
  expect(await screen.findByRole('button', { name: /sign in/i })).toBeVisible();
});

test('user must login again if session expired', async () => {
  const signOutAfterMilliseconds = 1000;
  renderRoute(IndexPage, { signOutAfterMilliseconds });
  const user = userEvent.setup();

  const signInButton = await screen.findByRole('button', { name: /sign in/i });
  await user.click(signInButton);
  expect(await screen.findByRole('navigation')).toBeVisible();
  expect(await screen.findByRole('heading', { name: /19 oct 2023/i })).toBeVisible();

  vi.useFakeTimers();
  vi.advanceTimersByTime(signOutAfterMilliseconds);
  vi.advanceTimersByTime(AUTH_CHECK_INTERVAL);
  vi.useRealTimers();
  expect(await screen.findByRole('button', { name: /sign in/i })).toBeVisible();
});
