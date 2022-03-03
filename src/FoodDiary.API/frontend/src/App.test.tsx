import { render, screen } from '@testing-library/react';
import create from './testUtils/dsl';
import App from './App';

describe('App', () => {
  describe('when user authenticated', () => {
    test('should render navbar with pages list', () => {
      const ui = create
        .component(<App></App>)
        .withReduxStore(store => store.withAuthenticatedUser())
        .please();

      render(ui);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText(/Pages/)).toBeInTheDocument();
    });
  });
});
