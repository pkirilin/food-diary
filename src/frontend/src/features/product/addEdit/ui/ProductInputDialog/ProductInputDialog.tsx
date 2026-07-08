import { type FC, useState } from 'react';
import { ProductForm, type productModel } from '@/entities/product';
import { type SelectOption } from '@/shared/types';
import { Button, Dialog } from '@/shared/ui';

interface ProductInputDialogProps {
  opened: boolean;
  title: string;
  submitText: string;
  isLoading: boolean;
  categories: SelectOption[];
  categoriesLoading: boolean;
  productFormValues: productModel.ProductFormValues;
  onSubmit: (product: productModel.ProductFormValues) => Promise<void>;
  onClose: () => void;
}

export const ProductInputDialog: FC<ProductInputDialogProps> = ({
  opened,
  title,
  submitText,
  isLoading,
  categories,
  categoriesLoading,
  productFormValues,
  onSubmit,
  onClose,
}) => {
  // TODO: think about moving this to store
  const [isNutritionSuggesting, setIsNutritionSuggesting] = useState(false);

  const handleClose = (): void => {
    if (!isNutritionSuggesting) {
      onClose();
    }
  };

  return (
    <Dialog
      pinToTop
      renderMode="fullScreenOnMobile"
      title={title}
      opened={opened}
      onClose={handleClose}
      content={
        <ProductForm
          formId="product-input-form"
          defaultValues={productFormValues}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onSubmit={onSubmit}
          onNutritionSuggestingChange={setIsNutritionSuggesting}
        />
      }
      renderSubmit={submitProps => (
        <Button
          {...submitProps}
          type="submit"
          form="product-input-form"
          disabled={isNutritionSuggesting}
          loading={isLoading}
        >
          {submitText}
        </Button>
      )}
      renderCancel={cancelProps => (
        <Button
          {...cancelProps}
          type="button"
          disabled={isLoading || isNutritionSuggesting}
          onClick={handleClose}
        >
          Cancel
        </Button>
      )}
    />
  );
};
