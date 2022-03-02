export interface TestStoreBuilder {
  withAuthenticatedUser: () => TestStoreBuilder;
  please: () => void;
}

export const createTestStore = (): TestStoreBuilder => {
  const builder: TestStoreBuilder = {
    withAuthenticatedUser: () => {
      return builder;
    },

    please: (): void => {
      throw new Error('Function not implemented.');
    },
  };

  return builder;
};
