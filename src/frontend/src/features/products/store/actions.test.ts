import { createTestStore } from 'src/testing/store';
import { type SelectOption } from 'src/types';
import { actions } from './slice';
import { type ProductItemsFilter } from './types';

const { productChecked, productsChecked, productsUnchecked, productUnchecked } = actions;

test('products can be checked and unchecked', () => {
  const store = createTestStore();

  store.dispatch(productsChecked([1, 2, 3]));
  store.dispatch(productChecked(4));
  store.dispatch(productUnchecked(2));
  store.dispatch(productsUnchecked([1, 4, 3]));

  expect(store.getState().products.checkedProductIds).toStrictEqual<number[]>([]);
});

describe('productSearchNameChanged', () => {
  test('should apply filter by product name', () => {
    const store = createTestStore();

    store.dispatch(actions.productSearchNameChanged('test'));

    expect(store.getState().products.filter).toStrictEqual<ProductItemsFilter>({
      pageNumber: 1,
      pageSize: 10,
      productSearchName: 'test',
      category: null,
      changed: true,
    });
  });

  test('should reset pagination settings', () => {
    const store = createTestStore();

    store.dispatch(actions.pageNumberChanged(2));
    store.dispatch(actions.pageSizeChanged(20));
    store.dispatch(actions.productSearchNameChanged('test'));

    expect(store.getState().products.filter).toEqual(
      expect.objectContaining<Partial<ProductItemsFilter>>({
        pageNumber: 1,
        pageSize: 10,
      }),
    );
  });
});

describe('filterByCategoryChanged', () => {
  test('should apply filter by category', () => {
    const store = createTestStore();
    const category: SelectOption = { id: 1, name: 'Test category' };

    store.dispatch(actions.filterByCategoryChanged(category));

    expect(store.getState().products.filter).toStrictEqual<ProductItemsFilter>({
      pageNumber: 1,
      pageSize: 10,
      category,
      changed: true,
    });
  });

  test('should reset pagination settings', () => {
    const store = createTestStore();

    store.dispatch(actions.pageNumberChanged(2));
    store.dispatch(actions.pageSizeChanged(20));
    store.dispatch(actions.filterByCategoryChanged({ id: 1, name: 'Test category' }));

    expect(store.getState().products.filter).toEqual(
      expect.objectContaining<Partial<ProductItemsFilter>>({
        pageNumber: 1,
        pageSize: 10,
      }),
    );
  });
});

describe('filterReset', () => {
  test('should reset filter', () => {
    const store = createTestStore();

    store.dispatch(actions.pageNumberChanged(2));
    store.dispatch(actions.pageSizeChanged(20));
    store.dispatch(actions.productSearchNameChanged('test'));
    store.dispatch(actions.filterByCategoryChanged({ id: 1, name: 'Test category' }));
    store.dispatch(actions.filterReset());

    expect(store.getState().products.filter).toStrictEqual<ProductItemsFilter>({
      pageNumber: 1,
      pageSize: 10,
      category: null,
      changed: false,
    });
  });
});
