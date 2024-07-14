import { screen } from '@testing-library/dom';
import { type UserEvent } from '@testing-library/user-event';
import { type Mock } from 'vitest';
import { noteModel } from '@/entities/note';
import { type Note } from '../../model';

export const whenDialogOpened = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /open/i }));
};

export const whenDialogClosed = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /cancel/i }));
};

export const whenProductSelected = async (user: UserEvent, name: RegExp): Promise<void> => {
  await user.click(screen.getByRole('combobox', { name: /product/i }));
  await user.click(screen.getByRole('option', { name }));
};

export const whenProductCleared = async (user: UserEvent): Promise<void> => {
  await user.clear(screen.getByRole('combobox', { name: /product/i }));
};

export const whenProductSelectedNameChanged = async (
  user: UserEvent,
  name: string,
): Promise<void> => {
  await user.clear(screen.getByRole('combobox', { name: /product/i }));
  await user.type(screen.getByRole('combobox', { name: /product/i }), name);
};

export const whenProductSelectClosed = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('combobox', { name: /product/i }));
};

export const whenAddedNotExistingProductOption = async (
  user: UserEvent,
  name: string,
): Promise<void> => {
  await user.type(screen.getByRole('combobox', { name: /product/i }), name);
  await user.click(screen.getByRole('option', { name: new RegExp(`add "${name}"`, 'i') }));
};

export const whenEditedNotExistingProductOption = async (
  user: UserEvent,
  name: string,
): Promise<void> => {
  await user.click(screen.getByRole('combobox', { name: /product/i }));
  await user.click(screen.getByRole('option', { name: new RegExp(`edit "${name}"`, 'i') }));
};

export const whenQuantityChanged = async (user: UserEvent, value: number): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/product quantity/i));
  await user.type(screen.getByPlaceholderText(/product quantity/i), `${value}`);
};

export const whenNoteAdded = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /add/i }));
};

export const whenNoteSaved = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /save/i }));
};

export const whenProductNameChanged = async (user: UserEvent, name: string): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/product name/i));
  await user.type(screen.getByPlaceholderText(/product name/i), name);
};

export const whenProductCaloriesCostChanged = async (
  user: UserEvent,
  value: number,
): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/calories cost/i));
  await user.type(screen.getByPlaceholderText(/calories cost/i), `${value}`);
};

export const whenProductDefaultQuantityChanged = async (
  user: UserEvent,
  value: number,
): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/default quantity/i));
  await user.type(screen.getByPlaceholderText(/default quantity/i), `${value}`);
};

export const whenProductCategorySelected = async (user: UserEvent, name: RegExp): Promise<void> => {
  await user.click(screen.getByRole('combobox', { name: /category/i }));
  await user.click(screen.getByRole('option', { name }));
};

export const whenProductAdded = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /add/i }));
};

export const thenProductHasValue = async (value: string): Promise<void> => {
  expect(screen.getByRole('combobox', { name: /product/i })).toHaveValue(value);
};

export const thenProductIsInvalid = async (): Promise<void> => {
  expect(screen.getByRole('combobox', { name: /product/i })).toBeInvalid();
};

export const thenQuantityHasValue = async (value: number): Promise<void> => {
  expect(await screen.findByPlaceholderText(/product quantity/i)).toHaveValue(value.toString());
};

export const thenDialogShouldBeHidden = async (): Promise<void> => {
  expect(await screen.findByRole('button', { name: /open/i })).toBeVisible();
};

export const thenProductFormShouldBeVisible = async (): Promise<void> => {
  expect(await screen.findByRole('dialog', { name: /product/i }));
};

export const thenNoteFormShouldBeVisible = async (): Promise<void> => {
  expect(await screen.findByRole('dialog', { name: /note/i }));
};

export const thenProductNameHasValue = async (value: string): Promise<void> => {
  expect(screen.getByPlaceholderText(/product name/i)).toHaveValue(value);
};

export const thenProductNameIsInvalid = async (): Promise<void> => {
  expect(screen.getByPlaceholderText(/product name/i)).toBeInvalid();
};

export const thenProductCaloriesCostHasValue = async (value: number): Promise<void> => {
  expect(screen.getByPlaceholderText(/calories cost/i)).toHaveValue(value.toString());
};

export const thenProductDefaultQuantityHasValue = async (value: number): Promise<void> => {
  expect(screen.getByPlaceholderText(/default quantity/i)).toHaveValue(value.toString());
};

export const thenProductCategoryIsEmpty = async (): Promise<void> => {
  expect(screen.getByRole('combobox', { name: /category/i })).not.toHaveValue();
};

export const thenProductCategoryHasValue = async (value: string): Promise<void> => {
  expect(screen.getByRole('combobox', { name: /category/i })).toHaveValue(value);
};

export const thenAddNoteButtonIsDisabled = async (): Promise<void> => {
  expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
};

export const thenSaveNoteButtonIsDisabled = async (): Promise<void> => {
  expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
};

export const thenAddProductButtonIsDisabled = async (): Promise<void> => {
  expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
};

export const thenFormValueContains = async (
  onSubmitMock: Mock,
  { product, productQuantity }: Pick<Note, 'product' | 'productQuantity'>,
): Promise<void> => {
  expect(onSubmitMock).toHaveBeenCalledWith<[Note]>({
    mealType: noteModel.MealType.Breakfast,
    pageId: 1,
    displayOrder: 1,
    product,
    productQuantity,
  });
};
