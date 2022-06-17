import { render, screen } from '@testing-library/react';
import { create } from 'src/test-utils';
import App from './App';

test('authenticated user can navigate and view private content', () => {
  const ui = create
    .component(<App></App>)
    .withReduxStore()
    .withAuthToken('test_access_token')
    .please();

  render(ui);

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('heading')).toBeInTheDocument();
  expect(screen.getByRole('heading').textContent).toMatch(/Pages/);
});

test('unauthenticated user must sign in to access private content', () => {
  const ui = create
    .component(<App></App>)
    .withReduxStore()
    .withoutAuthToken()
    .please();

  render(ui);

  expect(screen.getByText(/Sign in/)).toBeInTheDocument();
});
