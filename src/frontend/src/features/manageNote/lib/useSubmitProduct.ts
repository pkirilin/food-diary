import { useAppDispatch } from '@/app/store';
import { noteApi } from '@/entities/note';
import {
  type CreateProductRequest,
  type EditProductRequest,
  productApi,
  type CreateProductResponse,
  type productModel,
  type OnSubmitProductFn,
} from '@/entities/product';
import { type NoteFormValuesProduct, actions } from '../model';

const toCreateProductRequest = (
  {
    name,
    calories: caloriesCost,
    defaultQuantity,
    protein,
    fats,
    carbs,
    sugar,
    salt,
  }: productModel.ProductFormValues,
  categoryId: number,
): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
  protein,
  fats,
  carbs,
  sugar,
  salt,
});

const toEditProductRequest = (
  {
    name,
    calories: caloriesCost,
    defaultQuantity,
    protein,
    fats,
    carbs,
    sugar,
    salt,
  }: productModel.ProductFormValues,
  productId: number,
  categoryId: number,
): EditProductRequest => ({
  id: productId,
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
  protein,
  fats,
  carbs,
  sugar,
  salt,
});

const toNoteFormValuesProduct = (
  id: number,
  {
    name,
    defaultQuantity,
    calories,
    protein,
    fats,
    carbs,
    sugar,
    salt,
  }: productModel.ProductFormValues,
): NoteFormValuesProduct => ({
  id,
  name,
  defaultQuantity,
  calories,
  protein,
  fats,
  carbs,
  sugar,
  salt,
});

const isCreateProductResponse = (response: unknown): response is CreateProductResponse => {
  return typeof response === 'object' && response !== null && 'id' in response;
};

const resolveProductId = (
  { id }: productModel.ProductFormValues,
  mutationResponse: unknown,
): number => {
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

  return async (product: productModel.ProductFormValues): Promise<void> => {
    const { id, category } = product;

    if (!category) {
      return;
    }

    const shouldUpdate = typeof id === 'number';

    dispatch(actions.productDraftSaveStarted());

    const mutationResponse = shouldUpdate
      ? await editProduct(toEditProductRequest(product, id, category.id))
      : await createProduct(toCreateProductRequest(product, category.id));

    if (mutationResponse.error) {
      dispatch(actions.productDraftSaveFailed());
      return;
    }

    const notesResponse = await dispatch(noteApi.util.getRunningQueryThunk('notes', { date }));

    if (notesResponse?.error) {
      return;
    }

    const productId = resolveProductId(product, mutationResponse.data);
    const productDraft = toNoteFormValuesProduct(productId, product);

    dispatch(actions.productDraftSaved(productDraft));
  };
};
