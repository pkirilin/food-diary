import { ThemeProvider } from '@mui/material';
import { type ReactElement } from 'react';
import { type Mock } from 'vitest';
import { theme } from '@/app/theme';
import { noteModel } from '@/entities/note';
import { type productModel, type ProductSelectOption } from '@/entities/product';
import { type SelectOption } from '@/shared/types';
import { AddOrEditNoteFlow } from './AddOrEditNoteFlow';

class AddOrEditNoteFlowBuilder {
  private readonly _products: ProductSelectOption[] = [];
  private readonly _categories: SelectOption[] = [];
  private _selectedProductName: string | null = null;
  private _quantity: number = 100;
  private _onSubmitMock: Mock = vi.fn();

  please(): ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <AddOrEditNoteFlow
          renderTrigger={handleClick => (
            <button type="button" onClick={handleClick}>
              Open
            </button>
          )}
          dialogTitle="Note"
          submitText="Submit"
          submitSuccess={false}
          product={this.getSelectedProduct()}
          noteFormValues={{
            pageId: 1,
            mealType: noteModel.MealType.Breakfast,
            displayOrder: 1,
            quantity: this._quantity,
          }}
          productAutocompleteData={{
            options: this._products,
            isLoading: false,
          }}
          categorySelect={{
            data: this._categories,
            isLoading: false,
          }}
          onSubmit={this._onSubmitMock}
          onSubmitSuccess={vi.fn()}
        />
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

export const givenAddOrEditNoteFlow = (): AddOrEditNoteFlowBuilder =>
  new AddOrEditNoteFlowBuilder();

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
