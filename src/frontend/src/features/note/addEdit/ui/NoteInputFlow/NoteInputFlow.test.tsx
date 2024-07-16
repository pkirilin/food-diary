import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  expectCategory,
  expectExistingProduct,
  expectNewProduct,
  givenNoteInputFlow,
} from './NoteInputFlow.builder';
import * as steps from './NoteInputFlow.steps';

test('Quantity is taken from note quantity when dialog opened', async () => {
  const user = userEvent.setup();

  render(
    givenNoteInputFlow()
      .withProductForSelect({ name: 'Test product', defaultQuantity: 123 })
      .withSelectedProduct('Test product')
      .withQuantity(321)
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.thenQuantityHasValue(321);
});

test('Quantity is taken from note quantity when dialog opened, closed without save, and opened again', async () => {
  const user = userEvent.setup();

  render(
    givenNoteInputFlow()
      .withProductForSelect({ name: 'First product', defaultQuantity: 200 })
      .withProductForSelect({ name: 'Second product', defaultQuantity: 300 })
      .withSelectedProduct('First product')
      .withQuantity(100)
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenProductSelected(user, /second product/i);
  await steps.whenDialogClosed(user);
  await steps.thenDialogShouldBeHidden();

  await steps.whenDialogOpened(user);
  await steps.thenQuantityHasValue(100);
});

test(`Quantity is taken from product's default quantity when adding note`, async () => {
  const user = userEvent.setup();

  render(
    givenNoteInputFlow()
      .withQuantity(100)
      .withProductForSelect({ name: 'Test product', defaultQuantity: 123 })
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenProductSelected(user, /test product/i);
  await steps.thenQuantityHasValue(123);
});

test(`Quantity is taken from product's default quantity when saving note`, async () => {
  const user = userEvent.setup();

  render(
    givenNoteInputFlow()
      .withProductForSelect({ name: 'First product', defaultQuantity: 200 })
      .withProductForSelect({ name: 'Second product', defaultQuantity: 300 })
      .withSelectedProduct('First product')
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenProductSelected(user, /second product/i);
  await steps.thenQuantityHasValue(300);
});

test('I can add new note with existing product and valid quantity', async () => {
  const user = userEvent.setup();
  const onSubmitMock = vi.fn();

  render(
    givenNoteInputFlow()
      .withQuantity(100)
      .withProductForSelect({ name: 'Test product', defaultQuantity: 123 })
      .withOnSubmit(onSubmitMock)
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenProductSelected(user, /test product/i);
  await steps.whenQuantityChanged(user, 150);
  await steps.whenNoteAdded(user);
  await steps.thenFormValueContains(onSubmitMock, {
    product: expectExistingProduct({
      name: 'Test product',
      defaultQuantity: 123,
    }),
    productQuantity: 150,
  });
});

test('I can add new note with new product', async () => {
  const user = userEvent.setup();
  const onSubmitMock = vi.fn();

  render(
    givenNoteInputFlow()
      .withQuantity(100)
      .withCategoriesForSelect('Test Category')
      .withOnSubmit(onSubmitMock)
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenAddedNotExistingProductOption(user, 'New product');
  await steps.thenProductFormShouldBeVisible();

  await steps.whenProductNameChanged(user, 'New super product');
  await steps.whenProductCaloriesCostChanged(user, 200);
  await steps.whenProductDefaultQuantityChanged(user, 175);
  await steps.whenProductCategorySelected(user, /test category/i);
  await steps.whenProductAdded(user);
  await steps.thenQuantityHasValue(175);

  await steps.whenQuantityChanged(user, 150);
  await steps.whenNoteAdded(user);
  await steps.thenFormValueContains(onSubmitMock, {
    product: expectNewProduct({
      name: 'New super product',
      defaultQuantity: 175,
      caloriesCost: 200,
      category: expectCategory('Test Category'),
    }),
    productQuantity: 150,
  });
});

test('I can save existing note with new product', async () => {
  const user = userEvent.setup();
  const onSubmitMock = vi.fn();

  render(
    givenNoteInputFlow()
      .withQuantity(100)
      .withProductForSelect({ name: 'Test product', defaultQuantity: 123 })
      .withCategoriesForSelect('Test Category')
      .withOnSubmit(onSubmitMock)
      .withSelectedProduct('Test product')
      .withEditDialog()
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenAddedNotExistingProductOption(user, 'New product');
  await steps.thenProductFormShouldBeVisible();

  await steps.whenProductNameChanged(user, 'New super product');
  await steps.whenProductCaloriesCostChanged(user, 200);
  await steps.whenProductDefaultQuantityChanged(user, 175);
  await steps.whenProductCategorySelected(user, /test category/i);
  await steps.whenProductAdded(user);
  await steps.thenQuantityHasValue(175);

  await steps.whenNoteSaved(user);
  await steps.thenFormValueContains(onSubmitMock, {
    product: expectNewProduct({
      name: 'New super product',
      defaultQuantity: 175,
      caloriesCost: 200,
      category: expectCategory('Test Category'),
    }),
    productQuantity: 175,
  });
});

test('I can close note dialog without save and add another note', async () => {
  const user = userEvent.setup();

  render(
    givenNoteInputFlow()
      .withQuantity(100)
      .withCategoriesForSelect('Test Category')
      .withProductForSelect({ name: 'Chicken' })
      .withProductForSelect({ name: 'Rice' })
      .withSelectedProduct('Chicken')
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenProductSelected(user, /rice/i);
  await steps.whenQuantityChanged(user, 150);
  await steps.whenDialogClosed(user);
  await steps.thenDialogShouldBeHidden();

  await steps.whenDialogOpened(user);
  await steps.thenProductHasValue('Chicken');
  await steps.thenQuantityHasValue(100);
});

test('I can close product dialog without save and add another product', async () => {
  const user = userEvent.setup();

  render(
    givenNoteInputFlow()
      .withQuantity(100)
      .withCategoriesForSelect('Test Category')
      .withProductForSelect({ name: 'Chicken' })
      .withProductForSelect({ name: 'Rice' })
      .withSelectedProduct('Chicken')
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenAddedNotExistingProductOption(user, 'Bre');
  await steps.thenProductFormShouldBeVisible();

  await steps.whenProductNameChanged(user, 'Bread');
  await steps.whenProductCaloriesCostChanged(user, 400);
  await steps.whenProductDefaultQuantityChanged(user, 50);
  await steps.whenProductCategorySelected(user, /test category/i);
  await steps.whenDialogClosed(user);
  await steps.thenNoteFormShouldBeVisible();
  await steps.thenProductHasValue('Chicken');

  await steps.whenAddedNotExistingProductOption(user, 'Rye bread');
  await steps.thenProductFormShouldBeVisible();
  await steps.thenProductNameHasValue('Rye bread');
  await steps.thenProductCaloriesCostHasValue(100);
  await steps.thenProductDefaultQuantityHasValue(100);
  await steps.thenProductCategoryIsEmpty();
});

test('I cannot add note if product is empty', async () => {
  const user = userEvent.setup();

  render(
    givenNoteInputFlow()
      .withQuantity(100)
      .withCategoriesForSelect('Test Category')
      .withProductForSelect({ name: 'Chicken' })
      .withSelectedProduct('Chicken')
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenProductCleared(user);
  await steps.thenProductIsInvalid();
  await steps.thenAddNoteButtonIsDisabled();
});

test(`I cannot add note if product has value that wasn't explicitly added`, async () => {
  const user = userEvent.setup();

  render(
    givenNoteInputFlow()
      .withQuantity(100)
      .withCategoriesForSelect('Test Category')
      .withProductForSelect({ name: 'Chicken' })
      .withSelectedProduct('Chicken')
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenProductSelectedNameChanged(user, 'ch');
  await steps.whenProductSelectClosed(user);
  await steps.thenProductIsInvalid();
  await steps.thenAddNoteButtonIsDisabled();
});

test('I cannot add note with new product if its name changed to invalid', async () => {
  const user = userEvent.setup();

  render(givenNoteInputFlow().withQuantity(100).withCategoriesForSelect('Test Category').please());

  await steps.whenDialogOpened(user);
  await steps.whenAddedNotExistingProductOption(user, 'Test');
  await steps.whenProductNameChanged(user, 'T');
  await steps.whenProductCaloriesCostChanged(user, 120);
  await steps.thenProductNameIsInvalid();
  await steps.thenAddProductButtonIsDisabled();
});

test('I cannot add note with new product if its name is invalid', async () => {
  const user = userEvent.setup();

  render(givenNoteInputFlow().withQuantity(100).withCategoriesForSelect('Test Category').please());

  await steps.whenDialogOpened(user);
  await steps.whenAddedNotExistingProductOption(user, 'T');
  await steps.whenProductCategorySelected(user, /test category/i);
  await steps.thenProductNameIsInvalid();
  await steps.thenAddProductButtonIsDisabled();
});

test(`I can continue editing new product I've added before`, async () => {
  const user = userEvent.setup();

  render(givenNoteInputFlow().withQuantity(100).withCategoriesForSelect('Vegetables').please());

  await steps.whenDialogOpened(user);
  await steps.whenAddedNotExistingProductOption(user, 'Potato');
  await steps.whenProductCaloriesCostChanged(user, 120);
  await steps.whenProductDefaultQuantityChanged(user, 80);
  await steps.whenProductCategorySelected(user, /vegetables/i);
  await steps.whenProductAdded(user);
  await steps.thenNoteFormShouldBeVisible();

  await steps.whenEditedNotExistingProductOption(user, 'Potato');
  await steps.thenProductFormShouldBeVisible();
  await steps.thenProductNameHasValue('Potato');
  await steps.thenProductCaloriesCostHasValue(120);
  await steps.thenProductDefaultQuantityHasValue(80);
  await steps.thenProductCategoryHasValue('Vegetables');
});

test('New product form is cleared after I change product to existing one', async () => {
  const user = userEvent.setup();

  render(
    givenNoteInputFlow()
      .withQuantity(100)
      .withProductForSelect({ name: 'Cucumber' })
      .withCategoriesForSelect('Vegetables')
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenAddedNotExistingProductOption(user, 'Potato');
  await steps.whenProductCaloriesCostChanged(user, 120);
  await steps.whenProductDefaultQuantityChanged(user, 80);
  await steps.whenProductCategorySelected(user, /vegetables/i);
  await steps.whenProductAdded(user);
  await steps.thenNoteFormShouldBeVisible();

  await steps.whenProductSelected(user, /cucumber/i);
  await steps.whenProductCleared(user);
  await steps.whenAddedNotExistingProductOption(user, 'Carrot');
  await steps.thenProductFormShouldBeVisible();
  await steps.thenProductNameHasValue('Carrot');
  await steps.thenProductCaloriesCostHasValue(100);
  await steps.thenProductDefaultQuantityHasValue(100);
  await steps.thenProductCategoryIsEmpty();
});
