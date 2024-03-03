import { create } from 'tests/dsl';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MealType, type NoteCreateEdit } from '../../models';

describe('when opened for existing note', () => {
  test(`should take quantity from note quantity`, async () => {
    const ui = create
      .NoteInputDialog()
      .withProductForSelect({ name: 'Test product', defaultQuantity: 123 })
      .withSelectedProduct('Test product')
      .withQuantity(321)
      .please();

    render(ui);

    const quantity = await screen.findByPlaceholderText(/product quantity/i);
    expect(quantity).toHaveValue(321);
  });
});

describe('when opened for edit, changed product, closed without save, and opened again', () => {
  test('should take quantity from note quantity', async () => {
    const user = userEvent.setup();
    const ui = create
      .NoteInputDialog()
      .withProductForSelect({ name: 'First product', defaultQuantity: 200 })
      .withProductForSelect({ name: 'Second product', defaultQuantity: 300 })
      .withSelectedProduct('First product')
      .withQuantity(100)
      .withOpenAndCloseOnButtonClick('Open dialog')
      .please();

    render(ui);
    await user.click(screen.getByText(/open dialog/i));
    await user.click(screen.getByPlaceholderText(/select a product/i));
    await user.click(within(screen.getByRole('listbox')).getByText(/second product/i));
    await user.click(screen.getByText(/cancel/i));
    await user.click(screen.getByText(/open dialog/i));

    expect(screen.getByPlaceholderText(/product quantity/i)).toHaveValue(100);
  });
});

describe('when product changed', () => {
  test(`should take quantity from product's default quantity if creating note`, async () => {
    const user = userEvent.setup();
    const ui = create
      .NoteInputDialog()
      .withQuantity(100)
      .withProductForSelect({ name: 'Test product', defaultQuantity: 123 })
      .please();

    render(ui);
    await user.click(screen.getByPlaceholderText(/select a product/i));
    await user.click(within(screen.getByRole('listbox')).getByText(/test product/i));

    expect(screen.getByPlaceholderText(/product quantity/i)).toHaveValue(123);
  });

  test(`should take quantity from product's default quantity if editing note`, async () => {
    const user = userEvent.setup();
    const ui = create
      .NoteInputDialog()
      .withProductForSelect({ name: 'First product', defaultQuantity: 200 })
      .withProductForSelect({ name: 'Second product', defaultQuantity: 300 })
      .withSelectedProduct('First product')
      .please();

    render(ui);
    await user.click(screen.getByPlaceholderText(/select a product/i));
    await user.click(within(screen.getByRole('listbox')).getByText(/second product/i));

    expect(screen.getByPlaceholderText(/product quantity/i)).toHaveValue(300);
  });
});

describe('when input is valid', () => {
  test('should submit form', async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();
    const ui = create
      .NoteInputDialog()
      .withQuantity(100)
      .withProductForSelect({ name: 'Test product', defaultQuantity: 123 })
      .withOnSubmit(onSubmitMock)
      .please();

    render(ui);

    const productInput = screen.getByPlaceholderText(/select a product/i);
    const quantityInput = screen.getByPlaceholderText(/product quantity/i);
    await user.click(productInput);
    await user.click(within(screen.getByRole('listbox')).getByText(/test product/i));
    await user.clear(quantityInput);
    await user.type(quantityInput, '150');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(onSubmitMock).toHaveBeenCalledWith({
      mealType: MealType.Breakfast,
      pageId: 1,
      productId: 1,
      productQuantity: 150,
      displayOrder: 1,
    } satisfies NoteCreateEdit);
  });
});
