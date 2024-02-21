import { WithTriggerButton } from 'tests/sideEffects';
import { type ReactElement } from 'react';
import { type Mock } from 'vitest';
import { MealType } from 'src/features/notes';
import NoteInputDialog from 'src/features/notes/components/NoteInputDialog';
import { type ProductSelectOption } from 'src/features/products';

export class NoteInputDialogBuilder {
  private readonly _products: ProductSelectOption[] = [];
  private _selectedProductName: string | null = null;
  private _quantity: number = 100;
  private _onSubmitMock: Mock = vi.fn();
  private _openAndCloseOnButtonClick: boolean = false;
  private _triggerButtonLabel: string = '';

  please(): ReactElement {
    return (
      <WithTriggerButton label={this._triggerButtonLabel}>
        {({ active, onTriggerClick }) => (
          <NoteInputDialog
            title="Test"
            submitText="Submit"
            isOpened={this._openAndCloseOnButtonClick ? active : true}
            mealType={MealType.Breakfast}
            pageId={1}
            product={this.getSelectedProduct()}
            products={this._products}
            productsLoading={false}
            quantity={this._quantity}
            displayOrder={1}
            onClose={this._openAndCloseOnButtonClick ? onTriggerClick : vi.fn()}
            onSubmit={this._onSubmitMock}
          />
        )}
      </WithTriggerButton>
    );
  }

  withProductForSelect({
    name = 'Test',
    defaultQuantity = 100,
  }: Partial<ProductSelectOption>): this {
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

  withOpenAndCloseOnButtonClick(label: string): this {
    this._openAndCloseOnButtonClick = true;
    this._triggerButtonLabel = label;
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
