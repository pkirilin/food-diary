import { createTestStore } from 'src/testing/store';
import { productChecked, productsChecked, productsUnchecked, productUnchecked } from './actions';

test('products can be checked and unchecked', () => {
  const store = createTestStore();

  store.dispatch(productsChecked([1, 2, 3]));
  store.dispatch(productChecked(4));
  store.dispatch(productUnchecked(2));
  store.dispatch(productsUnchecked([1, 4, 3]));

  expect(store.getState().products.checkedProductIds).toStrictEqual([]);
});
