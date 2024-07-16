import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  expectCategory,
  givenCategories,
  givenProductInputDialog,
  thenCaloriesCostHasValue,
  thenCaloriesCostIsInvalid,
  thenCategoryHasValue,
  thenCategoryIsInvalid,
  thenDefaultQuantityHasValue,
  thenDefaultQuantityIsInvalid,
  thenDialogShouldBeHidden,
  thenFormValueContains,
  thenProductFormIsVisible,
  thenProductNameHasValue,
  thenProductNameIsInvalid,
  thenProductNameIsValid,
  thenSubmitButtonIsDisabled,
  whenCaloriesCostChanged,
  whenCategoryCleared,
  whenCategorySelected,
  whenDefaultQuantityChanged,
  whenDialogClosed,
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
  await thenProductFormIsVisible();

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

test('I can edit product', async () => {
  const user = userEvent.setup();
  const onSubmitMock = vi.fn();
  const categories = givenCategories('Vegetables', 'Vegetables new');

  render(
    givenProductInputDialog()
      .withCategoriesForSelect(categories)
      .withProduct({
        name: 'Potato',
        caloriesCost: 150,
        defaultQuantity: 120,
        category: categories[1],
      })
      .withOnSubmitMock(onSubmitMock)
      .please(),
  );

  await whenDialogOpened(user);
  await thenProductFormIsVisible();

  await whenProductNameChanged(user, 'Potato edited');
  await whenCaloriesCostChanged(user, '140');
  await whenDefaultQuantityChanged(user, '110');
  await whenCategorySelected(user, /vegetables new/i);
  await whenProductSaved(user);
  await thenFormValueContains(onSubmitMock, {
    name: 'Potato edited',
    caloriesCost: 140,
    defaultQuantity: 110,
    category: expectCategory('Vegetables new'),
  });
});

test('I cannot add product with invalid name, calories cost or default quantity', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Fruits', 'Vegetables');

  render(givenProductInputDialog().withCategoriesForSelect(categories).please());

  await whenDialogOpened(user);
  await whenProductNameChanged(user, 'A');
  await whenCaloriesCostChanged(user, '0');
  await whenDefaultQuantityChanged(user, '0');
  await thenProductNameIsInvalid();
  await thenCaloriesCostIsInvalid();
  await thenDefaultQuantityIsInvalid();
  await thenSubmitButtonIsDisabled();
});

test('I cannot add product when category is empty', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Fruits', 'Vegetables');

  render(givenProductInputDialog().withCategoriesForSelect(categories).please());

  await whenDialogOpened(user);
  await whenProductNameChanged(user, 'Potato');
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

test('Dialog input is cleared on close', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Fruits', 'Fruits new');

  render(
    givenProductInputDialog()
      .withCategoriesForSelect(categories)
      .withProduct({
        name: 'Red apple',
        caloriesCost: 60,
        defaultQuantity: 120,
        category: categories[0],
      })
      .please(),
  );

  await whenDialogOpened(user);
  await whenProductNameChanged(user, 'Green apple');
  await whenCaloriesCostChanged(user, '70');
  await whenDefaultQuantityChanged(user, '110');
  await whenCategorySelected(user, /fruits new/i);
  await whenDialogClosed(user);
  await thenDialogShouldBeHidden();

  await whenDialogOpened(user);
  await thenProductNameHasValue('Red apple');
  await thenCaloriesCostHasValue(60);
  await thenDefaultQuantityHasValue(120);
  await thenCategoryHasValue('Fruits');
});

test('New product name input is valid by default', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Fruits');

  render(givenProductInputDialog().withCategoriesForSelect(categories).please());

  await whenDialogOpened(user);
  await thenProductNameIsValid();
});
