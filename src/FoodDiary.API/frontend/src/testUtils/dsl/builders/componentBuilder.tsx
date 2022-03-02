import { createTestStore, TestStoreBuilder } from './storeBuilder';

export interface TestComponentBuilder {
  withReduxStore: (
    configure: (builder: TestStoreBuilder) => TestStoreBuilder,
  ) => TestComponentBuilder;

  please: () => React.ReactElement;
}

const createComponentBuilder = (component: React.ReactElement) => {
  const builder: TestComponentBuilder = {
    withReduxStore: (configure): TestComponentBuilder => {
      const storeBuilder = createTestStore();
      configure(storeBuilder).please();
      return builder;
    },

    please: (): React.ReactElement => {
      throw new Error('Function not implemented.');
    },
  };

  return builder;
};

export default createComponentBuilder;
