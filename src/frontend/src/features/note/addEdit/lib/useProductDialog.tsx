import { useCallback, useState } from 'react';
import { CategorySelect, type categoryLib } from '@/entities/category';
import { ProductInputForm, type productModel } from '@/entities/product';
import { type DialogState } from '../model';

interface Args {
  productFormValues: productModel.FormValues;
  categorySelect: categoryLib.CategorySelectData;
  onClose: () => void;
  onSubmit: (values: productModel.FormValues) => void | Promise<void>;
}

interface Result {
  state: DialogState;
}

export const useProductDialog = ({
  productFormValues,
  categorySelect,
  onClose,
  onSubmit,
}: Args): Result => {
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const handleSubmitDisabledChange = useCallback((disabled: boolean): void => {
    setSubmitDisabled(disabled);
  }, []);

  return {
    state: {
      type: 'product',
      title: 'New product',
      submitText: 'Add',
      submitLoading: false,
      submitDisabled,
      cancelDisabled: false,
      formId: 'product-form',
      content: (
        <ProductInputForm
          touched
          id="product-form"
          values={productFormValues}
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
          onSubmitDisabledChange={handleSubmitDisabledChange}
        />
      ),
      onClose,
    },
  };
};
