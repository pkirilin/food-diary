import '@testing-library/jest-dom';
import { initMockApiDb } from './mockApi/initMockApiDb';
import { server } from './mockApi/server';

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

  // jsdom implements neither of these; the note dialog creates object URLs for uploaded photos
  Object.defineProperty(URL, 'createObjectURL', {
    writable: true,
    value: (): string => `blob:${crypto.randomUUID()}`,
  });

  Object.defineProperty(URL, 'revokeObjectURL', {
    writable: true,
    value: (): void => {},
  });

  // react-zoom-pan-pinch observes its wrapper element
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: class ResizeObserverStub {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
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
