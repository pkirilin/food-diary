import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create } from 'src/test-utils';
import { MealType, NoteCreateEdit } from '../../models';
import NoteCreateEditDialog from './NoteCreateEditDialog';

test('note can be created', async () => {
  const submitFn = jest.fn();
  const ui = create
    .component(
      <NoteCreateEditDialog
        open={true}
        pageId={1}
        mealType={MealType.Breakfast}
        onDialogConfirm={submitFn}
        onDialogCancel={jest.fn()}
      ></NoteCreateEditDialog>,
    )
    .withReduxStore()
    .please();

  render(ui);
  await userEvent.click(screen.getByRole('textbox', { name: /product/i }));
  await waitForElementToBeRemoved(screen.getByRole('progressbar'));
  await userEvent.click(within(screen.getByRole('listbox')).getByText(/meat/i));

  await userEvent.clear(screen.getByPlaceholderText(/quantity/i));
  await userEvent.type(screen.getByPlaceholderText(/quantity/i), '150');

  await userEvent.click(screen.getByText(/create/i));

  expect(submitFn).toHaveBeenCalledWith({
    mealType: MealType.Breakfast,
    displayOrder: 0,
    productId: 4,
    pageId: 1,
    productQuantity: 150,
  } as NoteCreateEdit);
});
