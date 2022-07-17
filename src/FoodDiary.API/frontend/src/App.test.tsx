import { screen } from '@testing-library/react';
import App from './App';
import { render } from './testing';

test('authenticated user can navigate and view private content', () => {
  render(<App></App>);

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('heading')).toBeInTheDocument();
  expect(screen.getByRole('heading').textContent).toMatch(/Pages/);
});

test('unauthenticated user must sign in to access private content', () => {
  render(<App></App>, { authToken: '' });

  expect(screen.getByText(/Sign in/)).toBeInTheDocument();
});
