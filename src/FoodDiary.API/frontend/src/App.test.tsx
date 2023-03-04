import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
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

// TODO: fix
// test('user must login again in case of expired token', async () => {
//   jest.useFakeTimers();
//   const TOKEN_REMOVE_TIMEOUT = 1000;
//   render(<App />, { withAuthentication: true, removeTokenAfterMilliseconds: TOKEN_REMOVE_TIMEOUT });

//   act(() => {
//     jest.advanceTimersByTime(TOKEN_REMOVE_TIMEOUT);
//     jest.advanceTimersByTime(TOKEN_CHECK_INTERVAL);
//   });

//   expect(screen.getByText(/sign in/i)).toBeInTheDocument();
//   jest.useRealTimers();
// });

test('user can logout of the application', async () => {
  render(<App />, { withAuthentication: true });

  await userEvent.click(screen.getByLabelText(/logout/i));

  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});
