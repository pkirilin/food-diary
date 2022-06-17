import { render, screen } from '@testing-library/react';
import { create } from 'src/test-utils';
import App from './App';

describe('App', () => {
  describe('when user authenticated', () => {
    test('should render navbar with pages list', () => {
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
  });

  describe('when user not authenticated', () => {
    test('should render sign in page', () => {
      const ui = create
        .component(<App></App>)
        .withReduxStore()
        .withoutAuthToken()
        .please();

      render(ui);

      expect(screen.getByText(/Sign in/)).toBeInTheDocument();
    });
  });
});
