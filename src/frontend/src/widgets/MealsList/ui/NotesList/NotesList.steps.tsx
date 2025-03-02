import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { type UserEvent } from '@testing-library/user-event';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { noteApi, type noteModel } from '@/entities/note';
import { NotesList } from './NotesList';

interface GivenNotesListArgs {
  mealType: noteModel.MealType;
  preloadNotes?: boolean;
}

export const givenNotesList = async ({
  mealType,
  preloadNotes = false,
}: GivenNotesListArgs): Promise<void> => {
  const store = configureStore();
  const date = '2023-10-19';

  if (preloadNotes) {
    await store.dispatch(noteApi.endpoints.notes.initiate({ date }));
  }

  render(
    <RootProvider store={store}>
      <NotesList date={date} mealType={mealType} />
    </RootProvider>,
  );
};

export const whenAddNoteButtonClicked = async (user: UserEvent): Promise<void> => {
  const addNoteButton = screen.getByRole('button', { name: /add note/i });
  await waitFor(() => expect(addNoteButton).not.toBeDisabled());
  await user.click(addNoteButton);
};

export const whenNoteClicked = async (user: UserEvent, noteName: RegExp): Promise<void> => {
  const noteButton = await screen.findByRole('button', { name: noteName });
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

export const whenProductCaloriesCostSet = async (
  user: UserEvent,
  calories: number,
): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/calories cost/i));
  await user.type(screen.getByPlaceholderText(/calories cost/i), calories.toString());
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

export const whenNoteAdded = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /add/i }));
};

export const whenNoteSaved = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /save/i }));
};

export const thenDialogVisible = async (dialogTitle: RegExp): Promise<void> => {
  expect(await screen.findByRole('dialog', { name: dialogTitle })).toBeVisible();
};

export const thenDialogNotVisible = async (): Promise<void> => {
  await waitForElementToBeRemoved(screen.getByRole('dialog'));
};

export const thenProductHasValue = (expectedValue: string): void => {
  expect(screen.getByRole('textbox', { name: /product/i })).toHaveValue(expectedValue);
};

export const thenQuantityHasValue = (expectedValue: string): void => {
  expect(screen.getByPlaceholderText(/quantity/i)).toHaveValue(expectedValue);
};

export const thenSingleNoteVisible = (noteName: RegExp): void => {
  expect(screen.getByRole('button', { name: noteName })).toBeVisible();
};
