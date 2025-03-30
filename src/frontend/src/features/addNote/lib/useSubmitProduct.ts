import { useAppDispatch } from '@/app/store';
import { noteApi } from '@/entities/note';
import {
  type CreateProductRequest,
  type EditProductRequest,
  productApi,
  type CreateProductResponse,
} from '@/entities/product';
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

const isCreateProductResponse = (response: unknown): response is CreateProductResponse => {
  return typeof response === 'object' && response !== null && 'id' in response;
};

const resolveProductId = ({ id }: ProductFormValues, mutationResponse: unknown): number => {
  if (isCreateProductResponse(mutationResponse)) {
    return mutationResponse.id;
  }

  if (typeof id !== 'number') {
    throw new Error('Expected existing product to have an id, but received: ' + typeof id);
  }

  return id;
};

export const useSubmitProduct = (date: string): OnSubmitProductFn => {
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

    const mutationResponse = shouldUpdate
      ? await editProduct(toEditProductRequest(product, id, category.id))
      : await createProduct(toCreateProductRequest(product, category.id));

    if (mutationResponse.error) {
      return;
    }

    const notesResponse = await dispatch(noteApi.util.getRunningQueryThunk('notes', { date }));

    if (notesResponse?.error) {
      return;
    }

    dispatch(
      actions.productDraftSubmitted({
        id: resolveProductId(product, mutationResponse.data),
        name: product.name,
        defaultQuantity: product.defaultQuantity,
      }),
    );
  };
};
