import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  expectCategory,
  givenCategories,
  givenProductInputDialog,
  thenCaloriesHasValue,
  thenCaloriesIsInvalid,
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
  whenCaloriesChanged,
  whenCarbsChanged,
  whenCategoryCleared,
  whenCategorySelected,
  whenDefaultQuantityChanged,
  whenDialogClosed,
  whenDialogOpened,
  whenFatsChanged,
  whenNutritionPanelExpanded,
  whenProductNameChanged,
  whenProductSaved,
  whenProteinChanged,
  whenSaltChanged,
  whenSugarChanged,
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
  await whenCaloriesChanged(user, '150');
  await whenDefaultQuantityChanged(user, '120');
  await whenCategorySelected(user, /vegetables/i);
  await whenProductSaved(user);
  await thenFormValueContains(onSubmitMock, {
    name: 'Potato',
    calories: 150,
    defaultQuantity: 120,
    category: expectCategory('Vegetables'),
    protein: null,
    fats: null,
    carbs: null,
    sugar: null,
    salt: null,
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
        calories: 150,
        defaultQuantity: 120,
        category: categories[1],
      })
      .withOnSubmitMock(onSubmitMock)
      .please(),
  );

  await whenDialogOpened(user);
  await thenProductFormIsVisible();

  await whenProductNameChanged(user, 'Potato edited');
  await whenCaloriesChanged(user, '140');
  await whenDefaultQuantityChanged(user, '110');
  await whenCategorySelected(user, /vegetables new/i);
  await whenNutritionPanelExpanded(user);
  await whenProteinChanged(user, '1.2');
  await whenFatsChanged(user, '0.4');
  await whenCarbsChanged(user, '25.8');
  await whenSugarChanged(user, '0.7');
  await whenSaltChanged(user, '0.05');
  await whenProductSaved(user);
  await thenFormValueContains(onSubmitMock, {
    name: 'Potato edited',
    calories: 140,
    defaultQuantity: 110,
    category: expectCategory('Vegetables new'),
    protein: 1.2,
    fats: 0.4,
    carbs: 25.8,
    sugar: 0.7,
    salt: 0.05,
  });
});

test('I cannot add product with invalid name, calories cost or default quantity', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Fruits', 'Vegetables');

  render(givenProductInputDialog().withCategoriesForSelect(categories).please());

  await whenDialogOpened(user);
  await whenProductNameChanged(user, 'A');
  await whenCaloriesChanged(user, '0');
  await whenDefaultQuantityChanged(user, '0');
  await whenProductSaved(user);
  await thenProductNameIsInvalid();
  await thenCaloriesIsInvalid();
  await thenDefaultQuantityIsInvalid();
});

test('I cannot save product when category is empty', async () => {
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
  await whenProductSaved(user);
  await thenCategoryIsInvalid();
});

test('Dialog input is cleared on close', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Fruits', 'Fruits new');

  render(
    givenProductInputDialog()
      .withCategoriesForSelect(categories)
      .withProduct({
        name: 'Red apple',
        calories: 60,
        defaultQuantity: 120,
        category: categories[0],
      })
      .please(),
  );

  await whenDialogOpened(user);
  await whenProductNameChanged(user, 'Green apple');
  await whenCaloriesChanged(user, '70');
  await whenDefaultQuantityChanged(user, '110');
  await whenCategorySelected(user, /fruits new/i);
  await whenDialogClosed(user);
  await thenDialogShouldBeHidden();

  await whenDialogOpened(user);
  await thenProductNameHasValue('Red apple');
  await thenCaloriesHasValue(60);
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
