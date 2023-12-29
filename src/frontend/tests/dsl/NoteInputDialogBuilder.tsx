import { type ReactElement } from 'react';
import { type Mock } from 'vitest';
import { MealType } from 'src/features/notes';
import NoteInputDialog from 'src/features/notes/components/NoteInputDialog';
import { type ProductSelectOption } from 'src/features/products';

export class NoteInputDialogBuilder {
  private readonly _products: ProductSelectOption[] = [];
  private _quantity: number = 100;
  private _onSubmitMock: Mock = vi.fn();

  please(): ReactElement {
    return (
      <NoteInputDialog
        title="Test"
        submitText="Submit"
        isOpened
        mealType={MealType.Breakfast}
        pageId={1}
        product={null}
        products={this._products}
        productsLoaded={true}
        productsLoading={false}
        onLoadProducts={vi.fn()}
        quantity={this._quantity}
        displayOrder={1}
        onClose={vi.fn()}
        onSubmit={this._onSubmitMock}
      />
    );
  }

  withProductForSelect({
    name = 'Test',
    defaultQuantity = 100,
  }: Partial<ProductSelectOption>): NoteInputDialogBuilder {
    this._products.push({
      id: this._products.length + 1,
      name,
      defaultQuantity,
    });
    return this;
  }

  withQuantity(quantity: number): NoteInputDialogBuilder {
    this._quantity = quantity;
    return this;
  }

  withOnSubmit(onSubmitMock: Mock): NoteInputDialogBuilder {
    this._onSubmitMock = onSubmitMock;
    return this;
  }
}
