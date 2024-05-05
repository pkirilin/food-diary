import { type TextFieldProps } from '@mui/material';
import { useCallback, useState } from 'react';
import { ProductInputForm, type productsModel } from '@/entities/products';
import { CategorySelect } from '@/features/categories';
import { type UseCategorySelectResult } from '@/features/products';
import { type UseInputResult } from '@/hooks';
import { type DialogState } from './types';

interface Args {
  productDialogValue: productsModel.ProductFormType;
  productNameInput: UseInputResult<string, TextFieldProps>;
  categorySelect: UseCategorySelectResult;
  onClose: () => void;
  onSubmit: (values: productsModel.ProductFormType) => void | Promise<void>;
}

interface Result {
  state: DialogState;
}

export const useProductDialog = ({
  productDialogValue,
  productNameInput,
  categorySelect,
  onClose,
  onSubmit,
}: Args): Result => {
  const [productSubmitDisabled, setProductSubmitDisabled] = useState(true);

  const handleProductInputFormSubmitDisabledChange = useCallback((disabled: boolean): void => {
    setProductSubmitDisabled(disabled);
  }, []);

  return {
    state: {
      type: 'product',
      title: 'New product',
      submitText: 'Add',
      submitLoading: false,
      submitDisabled: productSubmitDisabled,
      cancelDisabled: false,
      formId: 'product-form',
      content: (
        <ProductInputForm
          id="product-form"
          product={productDialogValue}
          productNameInput={productNameInput}
          renderCategoryInput={categoryInputProps => (
            <CategorySelect
              {...categoryInputProps}
              label="Category"
              placeholder="Select a category"
              options={categorySelect.data}
              optionsLoading={categorySelect.isLoading}
            />
          )}
          onSubmit={onSubmit}
          onSubmitDisabledChange={handleProductInputFormSubmitDisabledChange}
        />
      ),
      onClose,
    },
  };
};
