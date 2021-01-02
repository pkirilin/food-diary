import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { createBrowserHistory, History } from 'history';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import { RootState } from '../../../store';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@material-ui/core';
import { Router } from 'react-router-dom';
import theme from '../../../theme';

export type TestRootState = Partial<RootState>;
export type TestStateCreator = () => TestRootState;

export interface ExtendedRenderResult extends RenderResult {
  store: MockStoreEnhanced<TestRootState>;
  history: History;
  rerenderWithStateChange: (ui: React.ReactElement, createNewState: TestStateCreator) => void;
}

const mockStore = configureStore<TestRootState>();

function renderWithProviders(
  ui: React.ReactElement,
  store: MockStoreEnhanced<TestRootState>,
  history: History,
): RenderResult {
  const renderResult = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <Router history={history}>{ui}</Router>
      </ThemeProvider>
    </Provider>,
  );
  return renderResult;
}

/**
 * An extended testing library render method.
 * Renders specified component, wrapping it with redux mock store, theme provider and router
 * @param ui Component under test
 * @param createInitialState Redux initial test state creator function
 */
export function renderExtended(
  ui: React.ReactElement,
  createInitialState: TestStateCreator,
): ExtendedRenderResult {
  const initialState = createInitialState();
  const store = mockStore(initialState);
  const history = createBrowserHistory();
  let renderResult = renderWithProviders(ui, store, history);

  function rerenderWithStateChange(ui: React.ReactElement, createNewState: TestStateCreator): void {
    const newState = createNewState();
    const newStore = mockStore(newState);
    renderResult = renderWithProviders(ui, newStore, history);
  }

  return {
    ...renderResult,
    store,
    history,
    rerenderWithStateChange,
  };
}
