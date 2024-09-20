import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { type GetAuthStatusResponse } from '@/features/auth';
import { API_URL, AUTH_CHECK_INTERVAL } from '@/shared/config';
import { renderWithRouter } from '@tests/render';
import { server } from './mockApi/server';

test('user can login and logout', async () => {
  const user = userEvent.setup();
  renderWithRouter();

  const signInButton = await screen.findByRole('button', { name: /sign in/i });
  await user.click(signInButton);
  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();

  const openMenuButton = await screen.findByRole('button', { name: /open menu/i });
  await user.click(openMenuButton);
  expect(await screen.findByRole('navigation')).toBeVisible();

  const logoutButton = await screen.findByRole('button', { name: /logout/i });
  await user.click(logoutButton);
  expect(await screen.findByRole('button', { name: /sign in/i })).toBeVisible();
});

test.skip('user must login again if session expired', async () => {
  const user = userEvent.setup();
  renderWithRouter();

  await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
  const signInButton = await screen.findByRole('button', { name: /sign in/i });
  await user.click(signInButton);
  expect(await screen.findByRole('button', { name: /19 oct 2023/i })).toBeVisible();

  server.use(
    http.get(`${API_URL}/api/v1/auth/status`, () => {
      return HttpResponse.json<GetAuthStatusResponse>({
        isAuthenticated: false,
      });
    }),
  );

  vi.useFakeTimers();
  await vi.advanceTimersByTimeAsync(AUTH_CHECK_INTERVAL);
  vi.useRealTimers();

  expect(await screen.findByRole('button', { name: /sign in/i })).toBeVisible();
});
