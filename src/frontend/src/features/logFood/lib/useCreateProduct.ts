import { useMemo } from 'react';
import { useAppDispatch } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { productApi, type ProductFormServerErrors, type productModel } from '@/entities/product';
import { type ClientError, parseClientError, parseFieldValidationError } from '@/shared/api';
import { toCreatedMealDraftProduct, toCreateProductRequest } from './mapping';

interface CreateProductResult {
  isCreating: boolean;
  serverErrors: ProductFormServerErrors;
  formError: ClientError | null;
  createProduct: (values: productModel.ProductFormValues) => Promise<void>;
}

export const useCreateProduct = (onCreated: () => void): CreateProductResult => {
  const dispatch = useAppDispatch();
  const [createProductMutation, { isLoading, isError, error }] =
    productApi.useCreateProductMutation();

  const serverErrors = useMemo<ProductFormServerErrors>(
    () => ({ name: parseFieldValidationError(error, 'name') }),
    [error],
  );

  const formError = isError && serverErrors.name === null ? parseClientError(error) : null;

  const createProduct = async (values: productModel.ProductFormValues): Promise<void> => {
    if (values.category === null) {
      return;
    }

    const result = await createProductMutation(toCreateProductRequest(values.category.id, values));

    if ('error' in result) {
      return;
    }

    const product = toCreatedMealDraftProduct(result.data.id, values);
    dispatch(foodLogModel.actions.foodLogAdded({ product, quantity: product.defaultQuantity }));
    onCreated();
  };

  return { isCreating: isLoading, serverErrors, formError, createProduct };
};
