import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MealType, type NoteCreateEdit } from '../models';
import NoteInputDialog from './NoteInputDialog';

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
      product={{
        id: 1,
        name: 'Test product',
        defaultQuantity: 123,
      }}
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
      quantity={321}
      displayOrder={1}
      onClose={vi.fn()}
      onSubmit={onSubmitMock}
    />,
  );

  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(onSubmitMock).toHaveBeenCalledWith({
    mealType: MealType.Breakfast,
    pageId: 1,
    productId: 1,
    productQuantity: 123,
    displayOrder: 1,
  } satisfies NoteCreateEdit);
});
