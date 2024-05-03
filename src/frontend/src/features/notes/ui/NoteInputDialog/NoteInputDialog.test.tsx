import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  whenDialogOpened,
  givenNoteInputDialog,
  whenProductSelected,
  thenQuantityHasValue,
  whenQuantityChanged,
  whenDialogClosed,
  thenFormValueContains,
  thenDialogShouldBeHidden,
  whenAddedNotExistingProductOption,
  thenProductFormShouldBeVisible,
  whenProductNameChanged,
  whenProductDefaultQuantityChanged,
  whenProductCaloriesCostChanged,
  whenProductCategorySelected,
  whenProductAdded,
  expectCategory,
  expectNewProduct,
  expectExistingProduct,
  whenNoteSaved,
  thenProductHasValue,
  thenNoteFormShouldBeVisible,
  thenProductNameHasValue,
  thenProductDefaultQuantityHasValue,
  thenProductCaloriesCostHasValue,
  thenProductCategoryIsEmpty,
  whenProductCleared,
  thenSubmitNoteButtonIsDisabled,
  thenProductNameIsInvalid,
  thenProductIsInvalid,
  thenAddProductButtonIsDisabled,
} from './NoteInputDialog.fixture';

describe('when opened for existing note', () => {
  test(`should take quantity from note quantity`, async () => {
    const user = userEvent.setup();

    render(
      givenNoteInputDialog()
        .withProductForSelect({ name: 'Test product', defaultQuantity: 123 })
        .withSelectedProduct('Test product')
        .withQuantity(321)
        .please(),
    );

    await whenDialogOpened(user);
    await thenQuantityHasValue(321);
  });
});

describe('when opened for edit, changed product, closed without save, and opened again', () => {
  test('should take quantity from note quantity', async () => {
    const user = userEvent.setup();

    render(
      givenNoteInputDialog()
        .withProductForSelect({ name: 'First product', defaultQuantity: 200 })
        .withProductForSelect({ name: 'Second product', defaultQuantity: 300 })
        .withSelectedProduct('First product')
        .withQuantity(100)
        .please(),
    );

    await whenDialogOpened(user);
    await whenProductSelected(user, /second product/i);
    await whenDialogClosed(user);
    await thenDialogShouldBeHidden();

    await whenDialogOpened(user);
    await thenQuantityHasValue(100);
  });
});

describe('when changed product', () => {
  test(`should take quantity from product's default quantity if creating note`, async () => {
    const user = userEvent.setup();

    render(
      givenNoteInputDialog()
        .withQuantity(100)
        .withProductForSelect({ name: 'Test product', defaultQuantity: 123 })
        .please(),
    );

    await whenDialogOpened(user);
    await whenProductSelected(user, /test product/i);
    await thenQuantityHasValue(123);
  });

  test(`should take quantity from product's default quantity if editing note`, async () => {
    const user = userEvent.setup();

    render(
      givenNoteInputDialog()
        .withProductForSelect({ name: 'First product', defaultQuantity: 200 })
        .withProductForSelect({ name: 'Second product', defaultQuantity: 300 })
        .withSelectedProduct('First product')
        .please(),
    );

    await whenDialogOpened(user);
    await whenProductSelected(user, /second product/i);
    await thenQuantityHasValue(300);
  });
});

describe('when selected existing product with valid quantity', () => {
  test('should add new note', async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();

    render(
      givenNoteInputDialog()
        .withQuantity(100)
        .withProductForSelect({ name: 'Test product', defaultQuantity: 123 })
        .withOnSubmit(onSubmitMock)
        .please(),
    );

    await whenDialogOpened(user);
    await whenProductSelected(user, /test product/i);
    await whenQuantityChanged(user, 150);
    await whenNoteSaved(user);
    await thenFormValueContains(onSubmitMock, {
      product: expectExistingProduct({
        name: 'Test product',
        defaultQuantity: 123,
      }),
      productQuantity: 150,
    });
  });
});

describe('when added new product with valid quantity', () => {
  test('should add new note', async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();

    render(
      givenNoteInputDialog()
        .withQuantity(100)
        .withCategoriesForSelect('Test Category')
        .withOnSubmit(onSubmitMock)
        .please(),
    );

    await whenDialogOpened(user);
    await whenAddedNotExistingProductOption(user, 'New product');
    await thenProductFormShouldBeVisible();

    await whenProductNameChanged(user, 'New super product');
    await whenProductCaloriesCostChanged(user, 200);
    await whenProductDefaultQuantityChanged(user, 175);
    await whenProductCategorySelected(user, /test category/i);
    await whenProductAdded(user);
    await thenQuantityHasValue(175);

    await whenQuantityChanged(user, 150);
    await whenNoteSaved(user);
    await thenFormValueContains(onSubmitMock, {
      product: expectNewProduct({
        name: 'New super product',
        defaultQuantity: 175,
        caloriesCost: 200,
        category: expectCategory('Test Category'),
      }),
      productQuantity: 150,
    });
  });

  test('should save existing note', async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();

    render(
      givenNoteInputDialog()
        .withQuantity(100)
        .withProductForSelect({ name: 'Test product', defaultQuantity: 123 })
        .withCategoriesForSelect('Test Category')
        .withOnSubmit(onSubmitMock)
        .withSelectedProduct('Test product')
        .please(),
    );

    await whenDialogOpened(user);
    await whenAddedNotExistingProductOption(user, 'New product');
    await thenProductFormShouldBeVisible();

    await whenProductNameChanged(user, 'New super product');
    await whenProductCaloriesCostChanged(user, 200);
    await whenProductDefaultQuantityChanged(user, 175);
    await whenProductCategorySelected(user, /test category/i);
    await whenProductAdded(user);
    await thenQuantityHasValue(175);

    await whenNoteSaved(user);
    await thenFormValueContains(onSubmitMock, {
      product: expectNewProduct({
        name: 'New super product',
        defaultQuantity: 175,
        caloriesCost: 200,
        category: expectCategory('Test Category'),
      }),
      productQuantity: 175,
    });
  });
});

describe('when dialog closed without save', () => {
  test('should clear note values', async () => {
    const user = userEvent.setup();

    render(
      givenNoteInputDialog()
        .withQuantity(100)
        .withCategoriesForSelect('Test Category')
        .withProductForSelect({ name: 'Chicken' })
        .withProductForSelect({ name: 'Rice' })
        .withSelectedProduct('Chicken')
        .please(),
    );

    await whenDialogOpened(user);
    await whenProductSelected(user, /rice/i);
    await whenQuantityChanged(user, 150);
    await whenDialogClosed(user);
    await thenDialogShouldBeHidden();

    await whenDialogOpened(user);
    await thenProductHasValue('Chicken');
    await thenQuantityHasValue(100);
  });

  test('should clear product values', async () => {
    const user = userEvent.setup();

    render(
      givenNoteInputDialog()
        .withQuantity(100)
        .withCategoriesForSelect('Test Category')
        .withProductForSelect({ name: 'Chicken' })
        .withProductForSelect({ name: 'Rice' })
        .withSelectedProduct('Chicken')
        .please(),
    );

    await whenDialogOpened(user);
    await whenAddedNotExistingProductOption(user, 'Bre');
    await thenProductFormShouldBeVisible();

    await whenProductNameChanged(user, 'Bread');
    await whenProductCaloriesCostChanged(user, 400);
    await whenProductDefaultQuantityChanged(user, 50);
    await whenProductCategorySelected(user, /test category/i);
    await whenDialogClosed(user);
    await thenNoteFormShouldBeVisible();

    await whenAddedNotExistingProductOption(user, 'Rye bread');
    await thenProductFormShouldBeVisible();
    await thenProductNameHasValue('Rye bread');
    await thenProductCaloriesCostHasValue(100);
    await thenProductDefaultQuantityHasValue(100);
    await thenProductCategoryIsEmpty();
  });
});

describe('when input invalid', () => {
  test('should disable submit button for note', async () => {
    const user = userEvent.setup();

    render(
      givenNoteInputDialog()
        .withQuantity(100)
        .withCategoriesForSelect('Test Category')
        .withProductForSelect({ name: 'Chicken' })
        .withSelectedProduct('Chicken')
        .please(),
    );

    await whenDialogOpened(user);
    await whenProductCleared(user);
    await thenProductIsInvalid();
    await thenSubmitNoteButtonIsDisabled();
  });

  test('should disable submit button for product', async () => {
    const user = userEvent.setup();

    render(
      givenNoteInputDialog().withQuantity(100).withCategoriesForSelect('Test Category').please(),
    );

    await whenDialogOpened(user);
    await whenAddedNotExistingProductOption(user, 'Test');
    await whenProductNameChanged(user, 'T');
    await whenProductCaloriesCostChanged(user, 120);
    await thenProductNameIsInvalid();
    await thenAddProductButtonIsDisabled();
  });
});
