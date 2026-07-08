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
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <Dialog
      pinToTop
      renderMode="fullScreenOnMobile"
      title={title}
      opened={opened}
      onClose={onClose}
      content={
        <ProductForm
          formId="product-input-form"
          defaultValues={productFormValues}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onSubmit={onSubmit}
          onGeneratingChange={setIsGenerating}
        />
      }
      renderSubmit={submitProps => (
        <Button
          {...submitProps}
          type="submit"
          form="product-input-form"
          disabled={isGenerating}
          loading={isLoading}
        >
          {submitText}
        </Button>
      )}
      renderCancel={cancelProps => (
        <Button
          {...cancelProps}
          type="button"
          disabled={isLoading || isGenerating}
          onClick={onClose}
        >
          Cancel
        </Button>
      )}
    />
  );
};
