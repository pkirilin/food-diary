import { type FC, useState, useCallback, useEffect } from 'react';
import { CategorySelect } from '@/entities/category';
import { ProductInputForm, productLib, type productModel } from '@/entities/product';
import { type SelectOption } from '@/shared/types';
import { Button, Dialog } from '@/shared/ui';

interface ProductInputDialogProps {
  opened: boolean;
  title: string;
  submitText: string;
  isLoading: boolean;
  categories: SelectOption[];
  categoriesLoading: boolean;
  product: productModel.FormValues;
  onSubmit: (product: productModel.FormValues) => void;
  onClose: () => void;
}

export const ProductInputDialog: FC<ProductInputDialogProps> = ({
  opened,
  title,
  submitText,
  isLoading,
  categories,
  categoriesLoading,
  product,
  onSubmit,
  onClose,
}) => {
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const { values: productFormValues, clearValues: clearProductFormValues } =
    productLib.useFormValues(product);

  useEffect(() => {
    if (opened) {
      clearProductFormValues();
    }
  }, [clearProductFormValues, opened]);

  const handleSubmitDisabledChange = useCallback((disabled: boolean): void => {
    setSubmitDisabled(disabled);
  }, []);

  return (
    <Dialog
      renderMode="fullScreenOnMobile"
      title={title}
      opened={opened}
      onClose={onClose}
      content={
        <ProductInputForm
          id="product-input-form"
          values={productFormValues}
          onSubmit={onSubmit}
          onSubmitDisabledChange={handleSubmitDisabledChange}
          renderCategoryInput={categoryInputProps => (
            <CategorySelect
              {...categoryInputProps}
              label="Category"
              placeholder="Select a category"
              options={categories}
              optionsLoading={categoriesLoading}
            />
          )}
        />
      }
      renderSubmit={submitProps => (
        <Button
          {...submitProps}
          type="submit"
          form="product-input-form"
          disabled={submitDisabled}
          loading={isLoading}
        >
          {submitText}
        </Button>
      )}
      renderCancel={cancelProps => (
        <Button {...cancelProps} type="button" disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
      )}
    />
  );
};
