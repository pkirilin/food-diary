import React, { DependencyList, EffectCallback } from 'react';
import { Action, createStore, Reducer } from 'redux';
import { Provider } from 'react-redux';
import { act, render } from '@testing-library/react';
import { Status } from '../../models';
import useRefreshEffect from '../useRefreshEffect';

const STATUS_CHANGED = 'STATUS_CHANGED';

type StatusChangeAction = Action<string> & {
  status: Status;
};

const statusChanged = (status: Status) => ({
  type: STATUS_CHANGED,
  status,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const reducer: Reducer<Status, StatusChangeAction> = (state = 'idle', action) => {
  return action.type === STATUS_CHANGED ? action.status : 'idle';
};

const store = createStore(reducer);

const transientStatuses: Status[] = ['pending', 'failed'];

type TestWrapperProps = {
  effect: EffectCallback;
  deps?: DependencyList;
  activateOnInit?: boolean;
};

const TestWrapper: React.FC<TestWrapperProps> = ({
  effect,
  deps = [],
  activateOnInit = true,
}: TestWrapperProps) => {
  useRefreshEffect<Status>(state => state, effect, deps, activateOnInit);
  return null;
};

describe('useRefreshEffect hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
    store.dispatch(statusChanged('idle'));
  });

  describe('when status is initial', () => {
    test('should activate effect', () => {
      // Arrange
      const effectMock = jest.fn();

      // Act
      render(
        <Provider store={store}>
          <TestWrapper effect={effectMock}></TestWrapper>
        </Provider>,
      );

      // Assert
      expect(store.getState()).toEqual('idle');
      expect(effectMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('when status is initial and initial activation disabled', () => {
    test('should not activate effect', () => {
      // Arrange
      const effectMock = jest.fn();

      // Act
      render(
        <Provider store={store}>
          <TestWrapper effect={effectMock} activateOnInit={false}></TestWrapper>
        </Provider>,
      );

      // Assert
      expect(store.getState()).toEqual('idle');
      expect(effectMock).not.toHaveBeenCalled();
    });
  });

  describe('when status changed to successful', () => {
    test('should activate effect one more time', () => {
      // Arrange
      const effectMock = jest.fn();

      // Act
      render(
        <Provider store={store}>
          <TestWrapper effect={effectMock}></TestWrapper>
        </Provider>,
      );

      act(() => {
        store.dispatch(statusChanged('succeeded'));
      });

      // Assert
      expect(store.getState()).toEqual('succeeded');
      expect(effectMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('when status changed to any, except initial or successful', () => {
    transientStatuses.forEach(status => {
      test(`should not activate effect (status = '${status}')`, () => {
        // Arrange
        const effectMock = jest.fn();

        // Act
        render(
          <Provider store={store}>
            <TestWrapper effect={effectMock}></TestWrapper>
          </Provider>,
        );

        act(() => {
          store.dispatch(statusChanged(status));
        });

        // Assert
        expect(store.getState()).toEqual(status);
        expect(effectMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when additional passed dependency changed', () => {
    test('should activate effect', () => {
      // Arrange
      const effectMock = jest.fn();
      const deps = ['initial'];

      // Act
      const { rerender } = render(
        <Provider store={store}>
          <TestWrapper effect={effectMock} deps={deps}></TestWrapper>
        </Provider>,
      );

      deps[0] = 'changed';

      rerender(
        <Provider store={store}>
          <TestWrapper effect={effectMock} deps={deps}></TestWrapper>
        </Provider>,
      );

      // Assert
      expect(effectMock).toHaveBeenCalledTimes(2);
    });
  });
});
