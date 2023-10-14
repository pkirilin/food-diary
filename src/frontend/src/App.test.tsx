import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';
import { AUTH_CHECK_INTERVAL } from './config';
import { render } from './testing';

test('authenticated user can navigate and view private content', () => {
  render(<App />);

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('heading')).toBeInTheDocument();
  expect(screen.getByRole('heading').textContent).toMatch(/Pages/);
});

test('unauthenticated user must sign in to access private content', () => {
  render(<App />, { withAuthentication: false });

  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});

test('user must login again if session expired', async () => {
  const SIGN_OUT_TIMEOUT = 1000;

  vi.useFakeTimers();
  render(<App />, { withAuthentication: true, signOutAfterMilliseconds: SIGN_OUT_TIMEOUT });
  act(() => {
    vi.advanceTimersByTime(SIGN_OUT_TIMEOUT);
    vi.advanceTimersByTime(AUTH_CHECK_INTERVAL);
  });
  vi.useRealTimers();

  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});

test('user can logout of the application', async () => {
  render(<App />, { withAuthentication: true });

  await userEvent.click(screen.getByLabelText(/logout/i));

  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});
