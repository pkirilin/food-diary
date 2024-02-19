import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AUTH_CHECK_INTERVAL } from './config';
import { renderApp } from './testing/render';

test('user can login and logout', async () => {
  renderApp();
  const user = userEvent.setup();

  const signInButton = await screen.findByRole('button', { name: /sign in/i });
  await user.click(signInButton);
  expect(await screen.findByRole('navigation')).toBeVisible();
  expect(screen.getByRole('heading', { name: /Pages/i })).toBeVisible();

  const logoutButton = await screen.findByRole('button', { name: /logout/i });
  await user.click(logoutButton);
  expect(await screen.findByRole('button', { name: /sign in/i })).toBeVisible();
});

test('user must login again if session expired', async () => {
  const signOutAfterMilliseconds = 1000;
  renderApp({ signOutAfterMilliseconds });
  const user = userEvent.setup();

  const signInButton = await screen.findByRole('button', { name: /sign in/i });
  await user.click(signInButton);
  expect(await screen.findByRole('navigation')).toBeVisible();
  expect(screen.getByRole('heading', { name: /Pages/i })).toBeVisible();

  vi.useFakeTimers();
  vi.advanceTimersByTime(signOutAfterMilliseconds);
  vi.advanceTimersByTime(AUTH_CHECK_INTERVAL);
  vi.useRealTimers();

  expect(await screen.findByRole('button', { name: /sign in/i })).toBeVisible();
});
