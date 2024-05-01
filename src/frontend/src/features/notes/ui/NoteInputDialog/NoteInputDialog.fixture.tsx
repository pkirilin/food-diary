import { ThemeProvider } from '@mui/material';
import { screen } from '@testing-library/dom';
import { type UserEvent } from '@testing-library/user-event';
import { type ReactElement } from 'react';
import { type Mock } from 'vitest';
import { type productsModel } from '@/entities/products';
import { MealType, type NoteCreateEdit, NoteInputDialog } from '@/features/notes';
import theme from '@/theme';
import { WithTriggerButton } from '@tests/sideEffects';
import { type ProductSelectOption } from 'src/features/products';

class NoteInputDialogBuilder {
  private readonly _products: ProductSelectOption[] = [];
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
              title="Test"
              submitText="Submit"
              mealType={MealType.Breakfast}
              pageId={1}
              product={this.getSelectedProduct()}
              quantity={this._quantity}
              displayOrder={1}
              productAutocomplete={{
                options: this._products,
                isLoading: false,
              }}
              categorySelect={{
                data: [],
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
  }: Partial<productsModel.AutocompleteExistingOption>): this {
    this._products.push({
      id: this._products.length + 1,
      name,
      defaultQuantity,
    });

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

export const whenQuantityChanged = async (user: UserEvent, value: number): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/product quantity/i));
  await user.type(screen.getByPlaceholderText(/product quantity/i), `${value}`);
};

export const whenFormSubmitted = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /submit/i }));
};

export const thenQuantityHasValue = async (value: number): Promise<void> => {
  expect(await screen.findByPlaceholderText(/product quantity/i)).toHaveValue(value);
};

export const thenDialogShouldBeHidden = async (): Promise<void> => {
  expect(await screen.findByRole('button', { name: /open/i })).toBeVisible();
};

interface FormSubmittedValue {
  product: Partial<NoteCreateEdit['product']>;
  productQuantity: NoteCreateEdit['productQuantity'];
}

export const thenFormValueContains = async (
  onSubmitMock: Mock,
  { product, productQuantity }: FormSubmittedValue,
): Promise<void> => {
  expect(onSubmitMock).toHaveBeenCalledWith<[NoteCreateEdit]>({
    mealType: MealType.Breakfast,
    pageId: 1,
    displayOrder: 1,
    product: expect.objectContaining<Partial<productsModel.AutocompleteExistingOption>>({
      name: product.name,
      defaultQuantity: product.defaultQuantity,
    }),
    productQuantity,
  });
};
