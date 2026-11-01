import { useMemo } from 'react';
import { useAppDispatch } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { productApi, type ProductFormServerErrors, type productModel } from '@/entities/product';
import { type ClientError, parseClientError, parseFieldValidationError } from '@/shared/api';
import { fromProductFormValues, toEditProductRequest } from './mapping';

interface EditProductResult {
  isSaving: boolean;
  serverErrors: ProductFormServerErrors;
  formError: ClientError | null;
  editProduct: (values: productModel.ProductFormValues) => Promise<void>;
}

export const useEditProduct = (productId: number, onSaved: () => void): EditProductResult => {
  const dispatch = useAppDispatch();
  const [editProductMutation, { isLoading, isError, error }] = productApi.useEditProductMutation();

  const serverErrors = useMemo<ProductFormServerErrors>(
    () => ({ name: parseFieldValidationError(error, 'name') }),
    [error],
  );

  const formError = isError && serverErrors.name === null ? parseClientError(error) : null;

  const editProduct = async (values: productModel.ProductFormValues): Promise<void> => {
    if (values.category === null) {
      return;
    }

    const result = await editProductMutation(
      toEditProductRequest(productId, values.category.id, values),
    );

    if ('error' in result) {
      return;
    }

    dispatch(foodLogModel.actions.productUpdated(fromProductFormValues(productId, values)));
    onSaved();
  };

  return { isSaving: isLoading, serverErrors, formError, editProduct };
};
