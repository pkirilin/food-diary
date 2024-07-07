import { ThemeProvider } from '@mui/material';
import { screen, waitForElementToBeRemoved } from '@testing-library/dom';
import { type UserEvent } from '@testing-library/user-event';
import { type ReactElement } from 'react';
import { type Mock } from 'vitest';
import { theme } from '@/app/theme';
import { productModel } from '@/entities/product';
import { type SelectOption } from '@/shared/types';
import { WithTriggerButton } from '@tests/sideEffects';
import { ProductInputDialog } from './ProductInputDialog';

class ProductInputDialogBuilder {
  private _onSubmitMock: Mock = vi.fn();
  private _product: productModel.FormValues = productModel.EMPTY_FORM_VALUES;
  private readonly _categories: SelectOption[] = [];

  please(): ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <WithTriggerButton label="Open">
          {({ active, onTriggerClick }) => (
            <ProductInputDialog
              opened={active}
              title="Product"
              submitText="Submit"
              isLoading={false}
              categories={this._categories}
              categoriesLoading={false}
              productFormValues={this._product}
              onSubmit={this._onSubmitMock}
              onClose={onTriggerClick}
            />
          )}
        </WithTriggerButton>
      </ThemeProvider>
    );
  }

  withOnSubmitMock(onSubmitMock: Mock): this {
    this._onSubmitMock = onSubmitMock;
    return this;
  }

  withCategoriesForSelect(categories: SelectOption[]): this {
    this._categories.push(...categories);
    return this;
  }

  withProduct({
    name = '',
    caloriesCost = 100,
    defaultQuantity = 100,
    category = this._categories[0],
  }: Partial<productModel.FormValues>): this {
    this._product = {
      name,
      caloriesCost,
      defaultQuantity,
      category,
    };
    return this;
  }
}

export const givenCategories = (...categoryNames: string[]): SelectOption[] =>
  categoryNames.map((name, index) => ({ id: index + 1, name }));

export const givenProductInputDialog = (): ProductInputDialogBuilder =>
  new ProductInputDialogBuilder();

export const whenDialogOpened = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: 'Open' }));
};

export const whenDialogClosed = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /cancel/i }));
};

export const whenProductNameChanged = async (user: UserEvent, name: string): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/product name/i));
  await user.type(screen.getByPlaceholderText(/product name/i), name);
};

export const whenCaloriesCostChanged = async (user: UserEvent, cost: string): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/calories cost/i));
  await user.type(screen.getByPlaceholderText(/calories cost/i), cost);
};

export const whenDefaultQuantityChanged = async (
  user: UserEvent,
  quantity: string,
): Promise<void> => {
  await user.clear(screen.getByPlaceholderText(/default quantity/i));
  await user.type(screen.getByPlaceholderText(/default quantity/i), quantity);
};

export const whenCategorySelected = async (user: UserEvent, name: RegExp): Promise<void> => {
  await user.click(screen.getByRole('combobox', { name: /category/i }));
  await user.click(screen.getByRole('option', { name }));
};

export const whenCategoryCleared = async (user: UserEvent): Promise<void> => {
  await user.clear(screen.getByRole('combobox', { name: /category/i }));
};

export const whenProductSaved = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: /submit/i }));
};

export const expectCategory = (name: string): SelectOption =>
  expect.objectContaining<Partial<SelectOption>>({ name });

export const thenFormValueContains = async (
  onSubmitMock: Mock,
  product: productModel.FormValues,
): Promise<void> => {
  expect(onSubmitMock).toHaveBeenCalledWith<[productModel.FormValues]>(product);
};

export const thenProductNameIsInvalid = async (): Promise<void> => {
  expect(screen.getByPlaceholderText(/product name/i)).toBeInvalid();
};

export const thenProductNameIsValid = async (): Promise<void> => {
  expect(screen.getByPlaceholderText(/product name/i)).toBeValid();
};

export const thenProductNameHasValue = async (value: string): Promise<void> => {
  expect(screen.getByPlaceholderText(/product name/i)).toHaveValue(value);
};

export const thenCaloriesCostIsInvalid = async (): Promise<void> => {
  expect(screen.getByPlaceholderText(/calories cost/i)).toBeInvalid();
};

export const thenCaloriesCostHasValue = async (value: number): Promise<void> => {
  expect(screen.getByPlaceholderText(/calories cost/i)).toHaveValue(value);
};

export const thenDefaultQuantityIsInvalid = async (): Promise<void> => {
  expect(screen.getByPlaceholderText(/default quantity/i)).toBeInvalid();
};

export const thenDefaultQuantityHasValue = async (value: number): Promise<void> => {
  expect(screen.getByPlaceholderText(/default quantity/i)).toHaveValue(value);
};

export const thenCategoryIsInvalid = async (): Promise<void> => {
  expect(screen.getByRole('combobox', { name: /category/i })).toBeInvalid();
};

export const thenCategoryHasValue = async (value: string): Promise<void> => {
  expect(screen.getByRole('combobox', { name: /category/i })).toHaveValue(value);
};

export const thenSubmitButtonIsDisabled = async (): Promise<void> => {
  expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
};

export const thenDialogShouldBeHidden = async (): Promise<void> => {
  await waitForElementToBeRemoved(screen.getByRole('dialog'));
};
