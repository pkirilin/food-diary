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
          />
        )}
      </WithTriggerButton>
    );
  }

  withOnSubmitMock(onSubmitMock: Mock): this {
    this._onSubmitMock = onSubmitMock;
    return this;
  }

  withCategoriesForSelect(...categoryNames: string[]): this {
    this._categories.push(...categoryNames.map((name, index) => ({ id: index + 1, name })));
    return this;
  }
}

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

export const whenProductSaved = async (user: UserEvent): Promise<void> => {
  await user.click(screen.getByRole('button', { name: 'Submit' }));
};

export const expectCategory = (name: string): SelectOption =>
  expect.objectContaining<Partial<SelectOption>>({ name });

export const thenFormValueContains = async (
  onSubmitMock: Mock,
  product: ProductFormData,
): Promise<void> => {
  expect(onSubmitMock).toHaveBeenCalledWith<[ProductFormData]>(product);
};
