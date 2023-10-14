/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom';
import 'src/test-utils/customExpects';
import { server } from 'src/test-utils';
import { initializeDb } from 'src/testing/server/db';

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

beforeEach(() => initializeDb());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
