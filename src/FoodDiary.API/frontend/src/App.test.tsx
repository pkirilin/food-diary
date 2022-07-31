import { act, screen } from '@testing-library/react';
import App from './App';
import { TOKEN_CHECK_INTERVAL } from './config';
import { render } from './testing';

jest.useFakeTimers();

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
  render(<App />, { authToken: 'test_token', removeTokenAfterMilliseconds: 1000 });

  act(() => {
    jest.advanceTimersByTime(1000);
    jest.advanceTimersByTime(TOKEN_CHECK_INTERVAL);
  });

  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});
