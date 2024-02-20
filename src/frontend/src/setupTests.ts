/* eslint-disable @typescript-eslint/no-empty-function */
import '@testing-library/jest-dom';
import 'src/test-utils/customExpects';
import { initMockApiDb } from 'tests/mockApi';
import { server } from 'tests/mockApi/server';

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

  // For react-router-dom's <ScrollRestoration /> support
  Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: () => {},
  });

  server.listen();
});

beforeEach(async () => {
  await initMockApiDb();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
