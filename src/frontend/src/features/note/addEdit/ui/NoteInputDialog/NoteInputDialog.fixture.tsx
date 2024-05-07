import { ThemeProvider } from '@mui/material';
import { screen } from '@testing-library/dom';
import { type UserEvent } from '@testing-library/user-event';
import { type ReactElement } from 'react';
import { type Mock } from 'vitest';
import { theme } from '@/app/theme';
import { noteModel } from '@/entities/note';
import { type ProductSelectOption, type productModel } from '@/entities/product';
import { type SelectOption } from '@/shared/types';
import { WithTriggerButton } from '@tests/sideEffects';
import { type Note } from '../../model';
import { NoteInputDialog } from './NoteInputDialog';

class NoteInputDialogBuilder {
  private readonly _products: ProductSelectOption[] = [];
  private readonly _categories: SelectOption[] = [];
  private _selectedProductName: string | null = null;
  private _quantity: number = 100;
  private _onSubmitMock: Mock = vi.fn();

  please(): ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <WithTriggerButton label="Open">
          {({ active, onTriggerClick }) => (
            <NoteInputDialog
              opened={active}
              onClose={onTriggerClick}
              title="Note"
              submitText="Submit"
              mealType={noteModel.MealType.Breakfast}
              pageId={1}
              product={this.getSelectedProduct()}
              quantity={this._quantity}
              displayOrder={1}
              productAutocompleteData={{
                options: this._products,
                isLoading: false,
              }}
              categorySelect={{
                data: this._categories,
                isLoading: false,
              }}
              onSubmit={this._onSubmitMock}
              submitSuccess={false}
              onSubmitSuccess={vi.fn()}
            />
          )}
        </WithTriggerButton>
      </ThemeProvider>
    );
  }

  withProductForSelect({
    name = 'Test',
    defaultQuantity = 100,
  }: Partial<productModel.AutocompleteExistingOption>): this {
    this._products.push({
      id: this._products.length + 1,
      name,
      defaultQuantity,
    });

    return this;
  }

  withCategoriesForSelect(...categories: string[]): this {
    this._categories.push(...categories.map((name, index) => ({ id: index + 1, name })));
    return this;
  }

  withSelectedProduct(name: string): this {
    this._selectedProductName = name;
    return this;
  }

  withQuantity(quantity: number): this {
    this._quantity = quantity;
    return this;
  }

  withOnSubmit(onSubmitMock: Mock): this {
    this._onSubmitMock = onSubmitMock;
    return this;
  }

  private getSelectedProduct(): ProductSelectOption | null {
    if (this._selectedProductName === null) {
      return null;
    }

    const product = this._products.find(p => p.name === this._selectedProductName) ?? null;

    if (product === null) {
      throw new Error(
        `Product '${this._selectedProductName}' cannot be selected because it is not added to products for select`,
      );
    }

    return { ...product };
  }
}

export const givenNoteInputDialog = (): NoteInputDialogBuilder => new NoteInputDialogBuilder();

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

export const whenNoteSaved = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /submit/i }));
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

export const expectExistingProduct = ({
  name,
  defaultQuantity,
}: Omit<productModel.AutocompleteExistingOption, 'id'>): productModel.AutocompleteExistingOption =>
  expect.objectContaining<productModel.AutocompleteExistingOption>({
    id: expect.any(Number),
    name,
    defaultQuantity,
  });

export const expectNewProduct = ({
  name,
  caloriesCost,
  defaultQuantity,
  category,
}: Omit<
  productModel.AutocompleteFreeSoloOption,
  'freeSolo' | 'editing'
>): productModel.AutocompleteFreeSoloOption =>
  expect.objectContaining<productModel.AutocompleteFreeSoloOption>({
    freeSolo: true,
    editing: true,
    name,
    caloriesCost,
    defaultQuantity,
    category,
  });

export const expectCategory = (name: string): SelectOption =>
  expect.objectContaining<Partial<SelectOption>>({ name });

export const thenProductHasValue = async (value: string): Promise<void> => {
  expect(screen.getByRole('combobox', { name: /product/i })).toHaveValue(value);
};

export const thenProductIsInvalid = async (): Promise<void> => {
  expect(screen.getByRole('combobox', { name: /product/i })).toBeInvalid();
};

export const thenQuantityHasValue = async (value: number): Promise<void> => {
  expect(await screen.findByPlaceholderText(/product quantity/i)).toHaveValue(value);
};

export const thenDialogShouldBeHidden = async (): Promise<void> => {
  expect(await screen.findByRole('button', { name: /open/i })).toBeVisible();
};

export const thenProductFormShouldBeVisible = async (): Promise<void> => {
  expect(screen.getByRole('dialog', { name: /product/i }));
};

export const thenNoteFormShouldBeVisible = async (): Promise<void> => {
  expect(await screen.findByText(/note/i));
};

export const thenProductNameHasValue = async (value: string): Promise<void> => {
  expect(screen.getByPlaceholderText(/product name/i)).toHaveValue(value);
};

export const thenProductNameIsInvalid = async (): Promise<void> => {
  expect(screen.getByPlaceholderText(/product name/i)).toBeInvalid();
};

export const thenProductCaloriesCostHasValue = async (value: number): Promise<void> => {
  expect(screen.getByPlaceholderText(/calories cost/i)).toHaveValue(value);
};

export const thenProductDefaultQuantityHasValue = async (value: number): Promise<void> => {
  expect(screen.getByPlaceholderText(/default quantity/i)).toHaveValue(value);
};

export const thenProductCategoryIsEmpty = async (): Promise<void> => {
  expect(screen.getByRole('combobox', { name: /category/i })).not.toHaveValue();
};

export const thenSubmitNoteButtonIsDisabled = async (): Promise<void> => {
  expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
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
