import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createTestStore, TestStoreBuilder } from './storeBuilder';

export interface TestComponentBuilder {
  please: () => React.ReactElement;

  withReduxStore: (
    configure?: (builder: TestStoreBuilder) => TestStoreBuilder,
  ) => TestComponentBuilder;

  withRouter: () => TestComponentBuilder;
}

const createComponentBuilder = (component: React.ReactElement) => {
  const wrappers: React.ComponentType[] = [];

  const builder: TestComponentBuilder = {
    please: (): React.ReactElement => {
      const ui = wrappers.reduceRight(
        (element, Wrapper) => <Wrapper>{element}</Wrapper>,
        component,
      );

      return ui;
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
  };

  return builder;
};

export default createComponentBuilder;
