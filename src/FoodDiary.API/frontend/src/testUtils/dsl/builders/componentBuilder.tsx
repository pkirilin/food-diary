import React from 'react';
import { Provider } from 'react-redux';
import { createTestStore, TestStoreBuilder } from './storeBuilder';

export interface TestComponentBuilder {
  withReduxStore: (
    configure?: (builder: TestStoreBuilder) => TestStoreBuilder,
  ) => TestComponentBuilder;

  please: () => React.ReactElement;
}

const createComponentBuilder = (component: React.ReactElement) => {
  const components: React.ComponentType[] = [];

  const builder: TestComponentBuilder = {
    withReduxStore: (configure = builder => builder): TestComponentBuilder => {
      const storeBuilder = createTestStore();
      const store = configure(storeBuilder).please();
      components.push(({ children }) => <Provider store={store}>{children}</Provider>);
      return builder;
    },

    please: (): React.ReactElement => {
      const ui = components.reduceRight(
        (element, Wrapper) => <Wrapper>{element}</Wrapper>,
        component,
      );

      return ui;
    },
  };

  return builder;
};

export default createComponentBuilder;
