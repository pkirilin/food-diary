import { Alert, AlertTitle, Stack } from '@mui/material';
import { type FC } from 'react';
import { categoryLib } from '@/entities/category';
import { ProductForm, type productModel } from '@/entities/product';
import { Button } from '@/shared/ui';
import { useCreateProduct } from '../lib/useCreateProduct';

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
      {formError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>{formError.title}</AlertTitle>
          {formError.message}
        </Alert>
      )}
      <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2 }}>
        <Button type="submit" form={FORM_ID} variant="contained" loading={isCreating}>
          Create
        </Button>
      </Stack>
    </>
  );
};
