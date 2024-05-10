import { screen } from '@testing-library/dom';
import { type UserEvent } from '@testing-library/user-event';
import { type ReactElement } from 'react';
import { type Mock } from 'vitest';
import { type SelectOption } from '@/shared/types';
import { WithTriggerButton } from '@tests/sideEffects';
import { type ProductFormData } from '../../types';
import ProductInputDialog from './ProductInputDialog';

class ProductInputDialogBuilder {
  private _onSubmitMock: Mock = vi.fn();
  private _product: ProductFormData | undefined;
  private readonly _categories: SelectOption[] = [];

  please(): ReactElement {
    return (
      <WithTriggerButton label="Open">
        {({ active, onTriggerClick }) => (
          <ProductInputDialog
            isOpened={active}
            setIsOpened={onTriggerClick}
            title="Product"
            submitText="Submit"
            onSubmit={this._onSubmitMock}
            isLoading={false}
            categories={this._categories}
            categoriesLoading={false}
            product={this._product}
          />
        )}
      </WithTriggerButton>
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
  }: Partial<ProductFormData>): this {
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
  product: ProductFormData,
): Promise<void> => {
  expect(onSubmitMock).toHaveBeenCalledWith<[ProductFormData]>(product);
};

export const thenProductNameIsInvalid = async (): Promise<void> => {
  expect(screen.getByPlaceholderText(/product name/i)).toBeInvalid();
};

export const thenCaloriesCostIsInvalid = async (): Promise<void> => {
  expect(screen.getByPlaceholderText(/calories cost/i)).toBeInvalid();
};

export const thenDefaultQuantityIsInvalid = async (): Promise<void> => {
  expect(screen.getByPlaceholderText(/default quantity/i)).toBeInvalid();
};

export const thenCategoryIsInvalid = async (): Promise<void> => {
  expect(screen.getByRole('combobox', { name: /category/i })).toBeInvalid();
};

export const thenSubmitButtonIsDisabled = async (): Promise<void> => {
  expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
};
