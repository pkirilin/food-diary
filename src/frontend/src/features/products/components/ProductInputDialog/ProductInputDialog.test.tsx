import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  expectCategory,
  givenCategories,
  givenProductInputDialog,
  thenCategoryIsInvalid,
  thenFormValueContains,
  thenSubmitButtonIsDisabled,
  whenCaloriesCostChanged,
  whenCategoryCleared,
  whenCategorySelected,
  whenDefaultQuantityChanged,
  whenDialogOpened,
  whenProductNameChanged,
  whenProductSaved,
} from './ProductInputDialog.fixture';

test('I can add new product', async () => {
  const user = userEvent.setup();
  const onSubmitMock = vi.fn();
  const categories = givenCategories('Fruits', 'Vegetables');

  render(
    givenProductInputDialog()
      .withOnSubmitMock(onSubmitMock)
      .withCategoriesForSelect(categories)
      .please(),
  );

  await whenDialogOpened(user);
  await whenProductNameChanged(user, 'Potato');
  await whenCaloriesCostChanged(user, '150');
  await whenDefaultQuantityChanged(user, '120');
  await whenCategorySelected(user, /vegetables/i);
  await whenProductSaved(user);
  await thenFormValueContains(onSubmitMock, {
    name: 'Potato',
    caloriesCost: 150,
    defaultQuantity: 120,
    category: expectCategory('Vegetables'),
  });
});

test('I cannot add product when category is empty', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Fruits', 'Vegetables');

  render(givenProductInputDialog().withCategoriesForSelect(categories).please());

  await whenDialogOpened(user);
  await whenProductNameChanged(user, 'Potato');
  await thenCategoryIsInvalid();
  await thenSubmitButtonIsDisabled();
});

test('I cannot edit product when category is empty', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Fruits', 'Vegetables');

  render(
    givenProductInputDialog()
      .withCategoriesForSelect(categories)
      .withProduct({ name: 'Red apple', category: categories[0] })
      .please(),
  );

  await whenDialogOpened(user);
  await whenProductNameChanged(user, 'Green apple');
  await whenCategoryCleared(user);
  await thenCategoryIsInvalid();
  await thenSubmitButtonIsDisabled();
});
