import { Alert, Box, CircularProgress } from '@mui/material';
import { type FC } from 'react';
import { categoryLib } from '@/entities/category';
import { ProductForm, productApi } from '@/entities/product';
import { toProductFormValues } from '../lib/mapping';
import { useEditProduct } from '../lib/useEditProduct';
import { ProductFormFooter } from './ProductFormFooter';

const FORM_ID = 'log-food-edit-product-form';

interface Props {
  productId: number;
  onSaved: () => void;
}

export const EditProductForm: FC<Props> = ({ productId, onSaved }) => {
  const { data, isError } = productApi.useProductByIdQuery(productId);
  const { categories, categoriesLoading } = categoryLib.useCategoriesForSelect();
  const { isSaving, serverErrors, formError, editProduct } = useEditProduct(productId, onSaved);

  if (data === undefined && isError) {
    return <Alert severity="error">The product could not be loaded</Alert>;
  }

  if (data === undefined || categoriesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <ProductForm
        formId={FORM_ID}
        autoFocus
        defaultValues={toProductFormValues(data)}
        categories={categories}
        categoriesLoading={categoriesLoading}
        serverErrors={serverErrors}
        onSubmit={editProduct}
      />
      <ProductFormFooter
        formId={FORM_ID}
        formError={formError}
        submitting={isSaving}
        submitLabel="Save"
      />
    </>
  );
};
