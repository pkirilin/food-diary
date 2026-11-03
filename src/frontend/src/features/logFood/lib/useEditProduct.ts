import { useAppDispatch } from '@/app/store';
import { foodLogModel } from '@/entities/foodLog';
import { productApi, type ProductFormServerErrors, type productModel } from '@/entities/product';
import { type ClientError } from '@/shared/api';
import { releaseSoftKeyboardHold } from '@/shared/lib';
import { toMealDraftProductFromForm, toEditProductRequest } from './mapping';
import { useProductFormErrors } from './useProductFormErrors';

interface EditProductResult {
  isSaving: boolean;
  serverErrors: ProductFormServerErrors;
  formError: ClientError | null;
  editProduct: (values: productModel.ProductFormValues) => Promise<void>;
}

export const useEditProduct = (productId: number, onSaved: () => void): EditProductResult => {
  const dispatch = useAppDispatch();
  const [editProductMutation, { isLoading, isError, error }] = productApi.useEditProductMutation();

  const { serverErrors, formError } = useProductFormErrors(isError, error);

  const editProduct = async (values: productModel.ProductFormValues): Promise<void> => {
    if (values.category === null) {
      return;
    }

    const result = await editProductMutation(
      toEditProductRequest(productId, values.category.id, values),
    );

    if ('error' in result) {
      releaseSoftKeyboardHold();
      return;
    }

    dispatch(foodLogModel.actions.productUpdated(toMealDraftProductFromForm(productId, values)));
    onSaved();
  };

  return { isSaving: isLoading, serverErrors, formError, editProduct };
};
