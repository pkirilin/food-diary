import { Alert, Box, CircularProgress } from '@mui/material';
import { type FC, useState } from 'react';
import { categoryLib } from '@/entities/category';
import { ProductForm } from '@/entities/product';
import { holdSoftKeyboardForNextField, releaseSoftKeyboardHold } from '@/shared/lib';
import { toProductFormValues } from '../../lib/mapping';
import { useEditProduct } from '../../lib/useEditProduct';
import { useProductToEdit } from '../../lib/useProductToEdit';
import { ProductFormFooter } from '../ProductFormFooter';

const FORM_ID = 'log-food-edit-product-form';

interface Props {
  productId: number;
  onSaved: () => void;
}

export const EditProductForm: FC<Props> = ({ productId, onSaved }) => {
  const { product, productLoadFailed: loadFailed } = useProductToEdit(productId);
  const { categories, categoriesLoading } = categoryLib.useCategoriesForSelect();
  const [nutritionSuggesting, setNutritionSuggesting] = useState(false);
  const { isSaving, serverErrors, formError, editProduct } = useEditProduct(productId, onSaved);

  if (loadFailed) {
    return <Alert severity="error">The product could not be loaded</Alert>;
  }

  if (!product || categoriesLoading) {
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
        defaultValues={toProductFormValues(product)}
        categories={categories}
        categoriesLoading={categoriesLoading}
        serverErrors={serverErrors}
        onSubmitStarted={holdSoftKeyboardForNextField}
        onSubmitInvalid={releaseSoftKeyboardHold}
        onNutritionSuggestingChange={setNutritionSuggesting}
        onSubmit={editProduct}
      />
      <ProductFormFooter
        formId={FORM_ID}
        formError={formError}
        submitting={isSaving}
        submitDisabled={nutritionSuggesting}
        submitLabel="Save"
      />
    </>
  );
};
