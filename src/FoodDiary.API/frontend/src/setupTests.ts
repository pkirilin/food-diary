/* eslint-disable @typescript-eslint/no-empty-function */

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import 'src/test-utils/customExpects';
import { server } from 'src/test-utils';
import { categories } from 'src/testing/server/data';

beforeAll(() => {
  // For MUI Date picker to work in tests
  // https://github.com/mui/material-ui-pickers/issues/2073
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => ({
      media: query,
      matches: query === '(pointer: fine)',
      onchange: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

beforeAll(() => server.listen());

afterEach(() => {
  server.resetHandlers();
  categories.reset();
});

afterAll(() => server.close());
