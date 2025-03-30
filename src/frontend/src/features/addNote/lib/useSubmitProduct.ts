import { useAppDispatch } from '@/app/store';
import { type CreateProductRequest, type EditProductRequest, productApi } from '@/entities/product';
import { actions, type ProductFormValues } from '../model';
import { type OnSubmitProductFn } from '../ui/ProductForm';

const toCreateProductRequest = (
  { name, caloriesCost, defaultQuantity }: ProductFormValues,
  categoryId: number,
): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
});

const toEditProductRequest = (
  { name, caloriesCost, defaultQuantity }: ProductFormValues,
  productId: number,
  categoryId: number,
): EditProductRequest => ({
  id: productId,
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
});

export const useSubmitProduct = (): OnSubmitProductFn => {
  const [createProduct] = productApi.useCreateProductMutation();
  const [editProduct] = productApi.useEditProductMutation();
  const dispatch = useAppDispatch();

  return async (product: ProductFormValues): Promise<void> => {
    const { id, category } = product;

    if (!category) {
      return;
    }

    dispatch(actions.productDraftSaved(product));

    const shouldUpdate = typeof id === 'number';

    shouldUpdate
      ? await editProduct(toEditProductRequest(product, id, category.id))
      : await createProduct(toCreateProductRequest(product, category.id));
  };
};
