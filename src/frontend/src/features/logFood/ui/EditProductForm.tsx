import { Alert, AlertTitle, Box, CircularProgress, Stack } from '@mui/material';
import { type FC } from 'react';
import { categoryLib } from '@/entities/category';
import { ProductForm, productApi } from '@/entities/product';
import { Button } from '@/shared/ui';
import { toProductFormValues } from '../lib/mapping';
import { useEditProduct } from '../lib/useEditProduct';

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
      {formError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>{formError.title}</AlertTitle>
          {formError.message}
        </Alert>
      )}
      <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2 }}>
        <Button type="submit" form={FORM_ID} variant="contained" loading={isSaving}>
          Save
        </Button>
      </Stack>
    </>
  );
};
