import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  whenDialogOpened,
  givenNoteInputDialog,
  whenProductSelected,
  thenQuantityHasValue,
  whenQuantityChanged,
  whenFormSubmitted,
  whenDialogClosed,
  thenFormValueContains,
  thenDialogShouldBeHidden,
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

describe('when product changed', () => {
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

describe('when input is valid', () => {
  test('should submit form', async () => {
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
    await whenFormSubmitted(user);
    await thenFormValueContains(onSubmitMock, {
      product: {
        name: 'Test product',
        defaultQuantity: 123,
      },
      productQuantity: 150,
    });
  });
});
