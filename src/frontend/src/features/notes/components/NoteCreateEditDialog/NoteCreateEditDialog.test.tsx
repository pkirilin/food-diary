import { screen, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { render } from 'src/testing';
import { MealType, NoteCreateEdit } from '../../models';
import NoteCreateEditDialog from './NoteCreateEditDialog';

test('note can be created', async () => {
  const submitFn = vi.fn();

  render(
    <NoteCreateEditDialog
      open={true}
      pageId={1}
      mealType={MealType.Breakfast}
      onDialogConfirm={submitFn}
      onDialogCancel={vi.fn()}
    />,
  );

  await userEvent.click(screen.getByPlaceholderText(/select a product/i));
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

test('note with empty product cannot be created', async () => {
  render(
    <NoteCreateEditDialog
      open={true}
      pageId={1}
      mealType={MealType.Breakfast}
      onDialogConfirm={vi.fn()}
      onDialogCancel={vi.fn()}
      note={{
        id: 1,
        mealType: MealType.Breakfast,
        displayOrder: 0,
        productId: 1,
        productName: 'Bread',
        productQuantity: 100,
        calories: 100,
      }}
    />,
  );

  await userEvent.clear(screen.getByPlaceholderText(/select a product/i));

  expect(screen.getByText(/save/i)).toBeDisabled();
  expect(screen.getByText(/product is required/i)).toBeVisible();
});
