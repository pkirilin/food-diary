import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { type UserEvent } from '@testing-library/user-event';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { type noteModel } from '@/entities/note';
import { MealsListItem } from './MealsListItem';

interface GivenMealsListItemArgs {
  mealType: noteModel.MealType;
}

export const givenMealsListItem = async ({ mealType }: GivenMealsListItemArgs): Promise<void> => {
  const store = configureStore();
  const date = '2023-10-19';

  render(
    <RootProvider store={store}>
      <MealsListItem date={date} mealType={mealType} />
    </RootProvider>,
  );
};

export const whenAddNoteButtonClicked = async (user: UserEvent): Promise<void> => {
  const addNoteButton = screen.getByRole('button', { name: /add note/i });
  await waitFor(() => expect(addNoteButton).not.toBeDisabled());
  await user.click(addNoteButton);
};

export const whenNoteExpanded = async (user: UserEvent, noteName: RegExp): Promise<void> => {
  const noteButton = await screen.findByRole('button', { name: noteName });
  await user.click(noteButton);
};

export const whenEditNoteClicked = async (user: UserEvent): Promise<void> => {
  const noteButton = await screen.findByRole('button', { name: /edit/i });
  await user.click(noteButton);
};

export const whenProductSearched = async (user: UserEvent, searchText: string): Promise<void> => {
  await user.type(screen.getByPlaceholderText(/search products/i), searchText);
};

export const whenExistingProductSelected = async (
  user: UserEvent,
  productName: RegExp,
): Promise<void> => {
  await user.click(await screen.findByRole('button', { name: productName }));
};

export const whenQuantityChanged = async (user: UserEvent, quantity: number): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/quantity/i));
  await user.type(screen.getByPlaceholderText(/quantity/i), quantity.toString());
};

export const whenProductAddedFromInput = async (
  user: UserEvent,
  searchText: string,
): Promise<void> => {
  await user.click(
    await screen.findByRole('button', { name: new RegExp(`add "${searchText}"`, 'i') }),
  );
};

export const whenProductNameCompleted = async (user: UserEvent, nameEnd: string): Promise<void> => {
  await user.type(screen.getByPlaceholderText(/name/i), nameEnd);
};

export const whenProductNameEdited = async (user: UserEvent, name: string): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/name/i));
  await user.type(screen.getByPlaceholderText(/name/i), name);
};

export const whenProductCaloriesSet = async (user: UserEvent, calories: number): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/calories/i));
  await user.type(screen.getByPlaceholderText(/calories/i), calories.toString());
};

export const whenProductDefaultQuantitySet = async (
  user: UserEvent,
  quantity: number,
): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/default quantity/i));
  await user.type(screen.getByPlaceholderText(/default quantity/i), quantity.toString());
};

export const whenProductCategorySelected = async (
  user: UserEvent,
  category: RegExp,
): Promise<void> => {
  await user.click(screen.getByRole('combobox', { name: /category/i }));
  await user.click(screen.getByRole('option', { name: category }));
};

export const whenProductAdded = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /add/i }));
};

export const whenProductSaved = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /save/i }));
};

export const whenNoteAdded = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /add/i }));
};

export const whenNoteSaved = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /save/i }));
};

export const whenProductEditClicked = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /edit product/i }));
};

export const thenMealHeaderIsVisible = async (): Promise<void> => {
  const header = await screen.findByRole('listitem', { name: /lunch, [1-9][0-9]* kilocalories/i });
  expect(header).toBeVisible();
};

export const thenMealsAreVisible = async (): Promise<void> => {
  expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
};

export const thenDialogVisible = async (dialogTitle: RegExp): Promise<void> => {
  expect(await screen.findByRole('dialog', { name: dialogTitle })).toBeVisible();
};

export const thenNoteCannotBeAdded = async (): Promise<void> => {
  expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
};

export const thenNoteCanBeAdded = async (): Promise<void> => {
  expect(screen.getByRole('button', { name: /add/i })).not.toBeDisabled();
};

export const thenProductCanBeAdded = async (): Promise<void> => {
  expect(screen.getByRole('button', { name: /add/i })).not.toBeDisabled();
};

export const thenProductCanBeSaved = async (): Promise<void> => {
  expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
};

export const thenDialogNotVisible = async (): Promise<void> => {
  await waitForElementToBeRemoved(screen.getByRole('dialog'));
};

export const thenProductHasValue = async (expectedValue: string): Promise<void> => {
  expect(screen.getByRole('textbox', { name: /product/i })).toHaveValue(expectedValue);
};

export const thenQuantityHasValue = (expectedValue: string): void => {
  expect(screen.getByPlaceholderText(/quantity/i)).toHaveValue(expectedValue);
};

export const thenSingleNoteVisible = async (noteName: RegExp): Promise<void> => {
  expect(screen.getByRole('button', { name: noteName })).toBeVisible();
};
