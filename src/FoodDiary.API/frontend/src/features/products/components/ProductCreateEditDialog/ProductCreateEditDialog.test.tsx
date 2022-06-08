import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create } from 'src/test-utils';
import { ProductCreateEdit } from '../../models';
import ProductCreateEditDialog from './ProductCreateEditDialog';

test('product can be created', async () => {
  const submitFn = jest.fn();
  const ui = create
    .component(
      <ProductCreateEditDialog
        open={true}
        onDialogConfirm={submitFn}
        onDialogCancel={jest.fn()}
      ></ProductCreateEditDialog>,
    )
    .withReduxStore()
    .please();

  render(ui);
  await userEvent.type(screen.getByPlaceholderText(/product/i), 'Yoghurt');

  await userEvent.clear(screen.getByPlaceholderText(/calories cost/i));
  await userEvent.type(screen.getByPlaceholderText(/calories cost/i), '75');

  await userEvent.click(screen.getByRole('textbox', { name: /category/i }));
  await userEvent.click(within(screen.getByRole('listbox')).getByText(/dairy/i));

  await userEvent.click(screen.getByText(/create/i));

  expect(submitFn).toHaveBeenCalledWith({
    name: 'Yoghurt',
    caloriesCost: 75,
    categoryId: 3,
  } as ProductCreateEdit);
});
