import { ThemeProvider } from '@mui/material';
import { type ReactElement } from 'react';
import { type Mock } from 'vitest';
import theme from '@/theme';
import { type SelectOption } from '@/types';
import { type ProductFormType } from '../../model';

import { ProductInputDialog } from './ProductInputDialog';

class ProductFormTypeBuilder {
  private _category: SelectOption | null = null;

  please(): ProductFormType {
    return {
      name: '',
      caloriesCost: 100,
      defaultQuantity: 100,
      category: this._category,
    };
  }

  withCategory(category: SelectOption): this {
    this._category = category;
    return this;
  }
}

class ProductInputDialogBuilder {
  private _product: ProductFormType = createProduct().please();
  private _renderCategoryInputMock = vi.fn();
  private _onSubmitMock = vi.fn();

  please(): ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <ProductInputDialog
          opened
          submitting={false}
          title="Test"
          submitText="Submit"
          formId="test-form"
          product={this._product}
          renderCategoryInput={this._renderCategoryInputMock}
          onSubmit={this._onSubmitMock}
          onClose={vi.fn()}
        />
      </ThemeProvider>
    );
  }

  withProduct(product: ProductFormType): this {
    this._product = product;
    return this;
  }

  withRenderCategoryInputMock(fn: Mock): this {
    this._renderCategoryInputMock = fn;
    return this;
  }

  withOnSubmitMock(fn: Mock): this {
    this._onSubmitMock = fn;
    return this;
  }
}

export const createProduct = (): ProductFormTypeBuilder => new ProductFormTypeBuilder();

export const createProductInputDialog = (): ProductInputDialogBuilder =>
  new ProductInputDialogBuilder();
