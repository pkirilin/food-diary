import { type FC } from 'react';
import { categoryLib } from '@/entities/category';
import { ProductForm, type productModel } from '@/entities/product';
import { useCreateProduct } from '../lib/useCreateProduct';
import { ProductFormFooter } from './ProductFormFooter';

const FORM_ID = 'log-food-create-product-form';

interface Props {
  defaultValues: productModel.ProductFormValues;
  onCreated: () => void;
}

export const CreateProductForm: FC<Props> = ({ defaultValues, onCreated }) => {
  const { categories, categoriesLoading } = categoryLib.useCategoriesForSelect();
  const { isCreating, serverErrors, formError, createProduct } = useCreateProduct(onCreated);

  if (categoriesLoading) {
    return null;
  }

  return (
    <>
      <ProductForm
        formId={FORM_ID}
        autoFocus
        defaultValues={{
          ...defaultValues,
          category: defaultValues.category ?? categories.at(0) ?? null,
        }}
        categories={categories}
        categoriesLoading={categoriesLoading}
        serverErrors={serverErrors}
        onSubmit={createProduct}
      />
      <ProductFormFooter
        formId={FORM_ID}
        formError={formError}
        submitting={isCreating}
        submitLabel="Create"
      />
    </>
  );
};
