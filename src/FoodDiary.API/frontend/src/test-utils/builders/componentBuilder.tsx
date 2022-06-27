import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { createTestStore, TestStoreBuilder } from './storeBuilder';
import AuthProvider from 'src/features/auth/AuthProvider';
import theme from 'src/theme';

export interface TestComponentBuilder {
  please: () => React.ReactElement;
  withReduxStore: (
    configure?: (builder: TestStoreBuilder) => TestStoreBuilder,
  ) => TestComponentBuilder;
  withRouter: () => TestComponentBuilder;
  withAuthToken: (token: string) => TestComponentBuilder;
  withoutAuthToken: () => TestComponentBuilder;
}

type WrapperType = React.ComponentType<React.PropsWithChildren<unknown>>;

const createComponentBuilder = (component: React.ReactElement) => {
  const wrappers: WrapperType[] = [];

  const builder: TestComponentBuilder = {
    please: (): React.ReactElement => {
      const ui = wrappers.reduceRight(
        (element, Wrapper) => <Wrapper>{element}</Wrapper>,
        component,
      );

      return (
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>{ui}</LocalizationProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      );
    },

    withReduxStore: (configure = builder => builder): TestComponentBuilder => {
      const storeBuilder = createTestStore();
      const store = configure(storeBuilder).please();
      wrappers.push(({ children }) => <Provider store={store}>{children}</Provider>);
      return builder;
    },

    withRouter: (): TestComponentBuilder => {
      wrappers.push(({ children }) => <BrowserRouter>{children}</BrowserRouter>);
      return builder;
    },

    withAuthToken: (token: string): TestComponentBuilder => {
      wrappers.push(({ children }) => <AuthProvider token={token}>{children}</AuthProvider>);
      return builder;
    },

    withoutAuthToken: (): TestComponentBuilder => {
      wrappers.push(({ children }) => <AuthProvider>{children}</AuthProvider>);
      return builder;
    },
  };

  return builder;
};

export default createComponentBuilder;
