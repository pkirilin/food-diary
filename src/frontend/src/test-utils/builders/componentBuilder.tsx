import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { type ReactElement, type ComponentType, type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import theme from 'src/theme';
import { createTestStore, type TestStoreBuilder } from './storeBuilder';

export interface TestComponentBuilder {
  please: () => ReactElement;
  withReduxStore: (
    configure?: (builder: TestStoreBuilder) => TestStoreBuilder,
  ) => TestComponentBuilder;
}

type WrapperType = ComponentType<PropsWithChildren<unknown>>;

const createComponentBuilder = (component: ReactElement): TestComponentBuilder => {
  const wrappers: WrapperType[] = [];

  const builder: TestComponentBuilder = {
    please: (): ReactElement => {
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
  };

  return builder;
};

export default createComponentBuilder;
