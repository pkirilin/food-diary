import { useAppDispatch } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { productApi, type ProductFormServerErrors, type productModel } from '@/entities/product';
import { type ClientError } from '@/shared/api';
import { releaseSoftKeyboardHold } from '@/shared/lib';
import { toMealDraftProductFromForm, toCreateProductRequest } from './mapping';
import { useProductFormErrors } from './useProductFormErrors';

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

  const { serverErrors, formError } = useProductFormErrors(isError, error);

  const createProduct = async (values: productModel.ProductFormValues): Promise<void> => {
    if (values.category === null) {
      return;
    }

    const result = await createProductMutation(toCreateProductRequest(values.category.id, values));

    if ('error' in result) {
      releaseSoftKeyboardHold();
      return;
    }

    const product = toMealDraftProductFromForm(result.data.id, values);
    dispatch(foodLogModel.actions.foodLogAdded({ product, quantity: product.defaultQuantity }));
    onCreated();
  };

  return { isCreating: isLoading, serverErrors, formError, createProduct };
};
