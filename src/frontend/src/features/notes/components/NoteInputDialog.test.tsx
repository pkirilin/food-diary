import { create } from 'tests/dsl';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MealType, type NoteCreateEdit } from '../models';

describe('when opened for new note', () => {
  test(`should take quantity from product's default quantity`, async () => {
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
