import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { TOKEN_CHECK_INTERVAL } from './config';
import { render } from './testing';

test('authenticated user can navigate and view private content', () => {
  render(<App />);

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('heading')).toBeInTheDocument();
  expect(screen.getByRole('heading').textContent).toMatch(/Pages/);
});

test('unauthenticated user must sign in to access private content', () => {
  render(<App />, { authToken: '' });

  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});

test('user must login again in case of expired token', async () => {
  jest.useFakeTimers();
  const TOKEN_REmOVE_TIMEOUT = 1000;
  render(<App />, { authToken: 'test_token', removeTokenAfterMilliseconds: TOKEN_REmOVE_TIMEOUT });

  act(() => {
    jest.advanceTimersByTime(TOKEN_REmOVE_TIMEOUT);
    jest.advanceTimersByTime(TOKEN_CHECK_INTERVAL);
  });

  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  jest.useRealTimers();
});

test('user can logout of the application', async () => {
  render(<App />, { authToken: 'test_token' });

  await userEvent.click(screen.getByLabelText(/logout/i));

  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});
