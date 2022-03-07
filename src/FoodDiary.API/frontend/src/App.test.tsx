import { render, screen } from '@testing-library/react';
import create from './testUtils/dsl';
import App from './App';
import Cookies from 'js-cookie';

jest.mock('js-cookie');

describe('App', () => {
  describe('when user authenticated', () => {
    test('should render navbar with pages list', () => {
      jest.mocked(Cookies).get = jest.fn().mockReturnValue('test_access_token');

      const ui = create
        .component(<App></App>)
        .withReduxStore()
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
        .please();

      render(ui);

      expect(screen.getByText(/Sign in/)).toBeInTheDocument();
    });
  });
});
