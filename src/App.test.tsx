import React from 'react';
import App from './App';
import { renderExtended, TestRootState } from './features/__shared__/utils';

describe('App component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render without errors', () => {
    const createStateMock = (jest.fn() as jest.Mock<TestRootState>).mockReturnValue({
      pages: {
        pageItems: [],
        operationStatus: 'idle',
        selectedPageIds: [],
        totalPagesCount: 0,
        filter: {
          changed: false,
          pageNumber: 1,
          pageSize: 10,
        },
      },
    });

    renderExtended(<App></App>, createStateMock);
  });
});
