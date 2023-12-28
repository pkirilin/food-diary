import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MealType, type NoteCreateEdit } from '../models';
import NoteInputDialog from './NoteInputDialog';

test(`should fill quantity from selected product's default quantity`, async () => {
  const user = userEvent.setup();

  render(
    <NoteInputDialog
      title="Test"
      submitText="Submit"
      isOpened
      mealType={MealType.Breakfast}
      pageId={1}
      product={null}
      products={[
        {
          id: 1,
          name: 'Test product',
          defaultQuantity: 123,
        },
      ]}
      productsLoaded={true}
      productsLoading={false}
      onLoadProducts={vi.fn()}
      quantity={100}
      displayOrder={1}
      onClose={vi.fn()}
      onSubmit={vi.fn()}
    />,
  );

  await user.click(screen.getByPlaceholderText(/select a product/i));
  await user.click(within(screen.getByRole('listbox')).getByText(/test product/i));

  expect(screen.getByPlaceholderText(/product quantity/i)).toHaveValue(123);
});

test('should submit form on valid input', async () => {
  const user = userEvent.setup();
  const onSubmitMock = vi.fn();

  render(
    <NoteInputDialog
      title="Test"
      submitText="Submit"
      isOpened
      mealType={MealType.Breakfast}
      pageId={1}
      product={null}
      products={[
        {
          id: 1,
          name: 'Test product',
          defaultQuantity: 123,
        },
      ]}
      productsLoaded={true}
      productsLoading={false}
      onLoadProducts={vi.fn()}
      quantity={100}
      displayOrder={1}
      onClose={vi.fn()}
      onSubmit={onSubmitMock}
    />,
  );

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
