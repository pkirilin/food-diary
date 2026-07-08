import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type SuggestProductNutritionResponse } from '@/entities/product';
import {
  expectCategory,
  givenCategories,
  givenNutritionSuggestion,
  givenNutritionSuggestionFails,
  givenPendingNutritionSuggestion,
  givenProductInputDialog,
  thenAlertShown,
  thenCaloriesEventuallyHasValue,
  thenCaloriesHasValue,
  thenCaloriesIsInvalid,
  thenCarbsEventuallyHasValue,
  thenCategoryHasValue,
  thenCategoryIsInvalid,
  thenDefaultQuantityHasValue,
  thenDefaultQuantityIsInvalid,
  thenDialogShouldBeHidden,
  thenFatsEventuallyHasValue,
  thenFormValueContains,
  thenNameInputIsDisabled,
  thenProductFormIsVisible,
  thenProductNameHasValue,
  thenProductNameIsInvalid,
  thenProductNameIsValid,
  thenProteinEventuallyHasValue,
  thenSubmitIsDisabled,
  thenSubmitIsEnabled,
  thenSuggestButtonIsDisabled,
  thenSuggestButtonIsEnabled,
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
  whenSuggestClicked,
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

const allNull: SuggestProductNutritionResponse = {
  calories: null,
  protein: null,
  fats: null,
  carbs: null,
  sugar: null,
  salt: null,
};

test('empty nutrition fields are filled after clicking a suggest button', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Dairy');
  givenNutritionSuggestion({
    calories: 402,
    protein: 25,
    fats: 33.1,
    carbs: 1.3,
    sugar: null,
    salt: 1.8,
  });

  render(
    givenProductInputDialog()
      .withCategoriesForSelect(categories)
      .withProduct({ name: 'Cheddar cheese', category: categories[0] })
      .please(),
  );

  await whenDialogOpened(user);
  await whenNutritionPanelExpanded(user);
  await whenSuggestClicked(user, /suggest protein/i);

  await thenProteinEventuallyHasValue('25');
  await thenFatsEventuallyHasValue('33.1');
  await thenCaloriesEventuallyHasValue('100');
});

test('clicking the calories button overwrites its default value', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Dairy');
  givenNutritionSuggestion({ ...allNull, calories: 402 });

  render(
    givenProductInputDialog()
      .withCategoriesForSelect(categories)
      .withProduct({ name: 'Cheddar cheese', category: categories[0] })
      .please(),
  );

  await whenDialogOpened(user);
  await whenSuggestClicked(user, /suggest calories/i);

  await thenCaloriesEventuallyHasValue('402');
});

test('clicking a filled field button overwrites only that field', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Dairy');
  givenNutritionSuggestion({ ...allNull, protein: 25, carbs: 99 });

  render(
    givenProductInputDialog()
      .withCategoriesForSelect(categories)
      .withProduct({ name: 'Cheddar cheese', category: categories[0], protein: 1.2, carbs: 5 })
      .please(),
  );

  // Nutrition panel is already expanded by default here (protein/carbs are pre-filled),
  // so no expand click is needed — clicking it again would toggle it closed.
  await whenDialogOpened(user);
  await whenSuggestClicked(user, /suggest protein/i);

  await thenProteinEventuallyHasValue('25');
  await thenCarbsEventuallyHasValue('5');
});

test('suggest buttons are disabled until the name is valid', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Dairy');

  render(givenProductInputDialog().withCategoriesForSelect(categories).please());

  await whenDialogOpened(user);
  thenSuggestButtonIsDisabled(/suggest calories/i);

  await whenProductNameChanged(user, 'Cheddar cheese');
  thenSuggestButtonIsEnabled(/suggest calories/i);
});

test('inputs and submit are disabled while a suggestion is pending', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Dairy');
  givenPendingNutritionSuggestion({ ...allNull, calories: 402 });

  render(
    givenProductInputDialog()
      .withCategoriesForSelect(categories)
      .withProduct({ name: 'Cheddar cheese', category: categories[0] })
      .please(),
  );

  await whenDialogOpened(user);
  await whenSuggestClicked(user, /suggest calories/i);

  thenNameInputIsDisabled();
  thenSubmitIsDisabled();

  await thenCaloriesEventuallyHasValue('402');
  await thenSubmitIsEnabled();
});

test('API failure shows an error message', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Dairy');
  givenNutritionSuggestionFails();

  render(
    givenProductInputDialog()
      .withCategoriesForSelect(categories)
      .withProduct({ name: 'Cheddar cheese', category: categories[0] })
      .please(),
  );

  await whenDialogOpened(user);
  await whenSuggestClicked(user, /suggest calories/i);

  await thenAlertShown(/model response was invalid/i);
});

test('info message shown when nothing can be estimated', async () => {
  const user = userEvent.setup();
  const categories = givenCategories('Dairy');
  givenNutritionSuggestion(allNull);

  render(
    givenProductInputDialog()
      .withCategoriesForSelect(categories)
      .withProduct({ name: 'Cheddar cheese', category: categories[0] })
      .please(),
  );

  await whenDialogOpened(user);
  await whenSuggestClicked(user, /suggest calories/i);

  await thenAlertShown(/couldn't estimate nutrition/i);
});
