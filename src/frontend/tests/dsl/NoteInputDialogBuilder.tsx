import { WithTriggerButton } from 'tests/sideEffects';
import { ThemeProvider } from '@mui/material';
import { type ReactElement } from 'react';
import { type Mock } from 'vitest';
import { type productsModel } from '@/entities/products';
import { MealType, NoteInputDialog } from '@/features/notes';
import theme from '@/theme';
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
      <ThemeProvider theme={theme}>
        <WithTriggerButton label={this._triggerButtonLabel}>
          {({ active, onTriggerClick }) => (
            <NoteInputDialog
              title="Test"
              submitText="Submit"
              mealType={MealType.Breakfast}
              pageId={1}
              product={this.getSelectedProduct()}
              quantity={this._quantity}
              displayOrder={1}
              // renderProductAutocomplete={this.renderProductAutocomplete.bind(this)}
              // onClose={this._openAndCloseOnButtonClick ? onTriggerClick : vi.fn()}
              renderTrigger={openDialog => (
                <button onClick={openDialog}>{this._triggerButtonLabel}</button>
              )}
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

  private renderProductAutocomplete({
    value,
    onChange,
  }: productsModel.AutocompleteInputProps): ReactElement {
    return (
      <label>
        Product
        <select
          value={value?.name ?? ''}
          onChange={event => {
            const product = this._products.find(p => p.name === event.target.value);
            onChange(product ?? null);
          }}
        >
          {this._products.map(p => (
            <option key={p.id}>{p.name}</option>
          ))}
        </select>
      </label>
    );
  }
}
