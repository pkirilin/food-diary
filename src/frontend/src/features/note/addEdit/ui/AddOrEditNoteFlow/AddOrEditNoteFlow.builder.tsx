import { ThemeProvider } from '@mui/material';
import { type ReactElement } from 'react';
import { type Mock } from 'vitest';
import { theme } from '@/app/theme';
import { noteModel } from '@/entities/note';
import { type productModel, type ProductSelectOption } from '@/entities/product';
import { type SelectOption } from '@/shared/types';
import { EMPTY_RECOGNIZE_NOTES_RESULT, type RenderDialogProps } from '../../lib';
import { AddNoteDialog } from '../AddNoteDialog';
import { EditNoteDialog } from '../EditNoteDialog';
import { AddOrEditNoteFlow } from './AddOrEditNoteFlow';

class AddOrEditNoteFlowBuilder {
  private readonly _products: ProductSelectOption[] = [];
  private readonly _categories: SelectOption[] = [];
  private _selectedProductName: string | null = null;
  private _onSubmitMock: Mock = vi.fn();

  private _renderDialog: (props: RenderDialogProps) => ReactElement =
    this.renderAddDialog.bind(this);

  private readonly _noteFormValues: noteModel.FormValues = {
    pageId: 1,
    mealType: noteModel.MealType.Breakfast,
    displayOrder: 1,
    quantity: 100,
  };

  please(): ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <AddOrEditNoteFlow
          renderTrigger={handleClick => (
            <button type="button" onClick={handleClick}>
              Open
            </button>
          )}
          renderDialog={this._renderDialog}
          submitSuccess={false}
          product={this.getSelectedProduct()}
          productAutocompleteData={{
            options: this._products,
            isLoading: false,
          }}
          categorySelect={{
            data: this._categories,
            isLoading: false,
          }}
          recognizeNotesResult={EMPTY_RECOGNIZE_NOTES_RESULT}
          onCancel={vi.fn()}
          onSubmit={this._onSubmitMock}
          onSubmitSuccess={vi.fn()}
        />
      </ThemeProvider>
    );
  }

  withEditDialog(): this {
    this._renderDialog = this.renderEditDialog.bind(this);
    return this;
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
    this._noteFormValues.quantity = quantity;
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

  private renderAddDialog(props: RenderDialogProps): ReactElement {
    return (
      <AddNoteDialog
        {...props}
        noteFormValues={this._noteFormValues}
        recognizeNotesResult={{
          notes: [],
          isLoading: false,
          isSuccess: false,
        }}
        selectedInputMethod="fromInput"
        uploadedPhotos={[]}
        onUploadSuccess={vi.fn()}
        onSelectedInputMethodChange={vi.fn()}
      />
    );
  }

  private renderEditDialog(props: RenderDialogProps): ReactElement {
    return <EditNoteDialog {...props} noteFormValues={this._noteFormValues} />;
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
