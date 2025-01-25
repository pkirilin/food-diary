import { useCallback, type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { noteApi } from '@/entities/note';
import { type CreateProductRequest, productApi } from '@/entities/product';
import { type NoteFormValues, actions, selectors } from '../model';
import { type ProductFormValues } from '../model/productSchema';
import { ImagePreview } from './ImagePreview';
import { NoteForm } from './NoteForm';
import { ProductForm } from './ProductForm';
import { SearchProducts } from './SearchProducts';
import { SearchProductsOnImage } from './SearchProductsOnImage';

const toCreateProductRequest = (
  { name, caloriesCost, defaultQuantity }: ProductFormValues,
  categoryId: number,
): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
});

export const NoteInputFlow: FC = () => {
  const product = useAppSelector(state => state.addNote.note?.product);
  const noteDraft = useAppSelector(state => state.addNote.note);
  const productDraft = useAppSelector(state => state.addNote.product);
  const image = useAppSelector(state => state.addNote.image);
  const activeFormId = useAppSelector(selectors.activeFormId);
  const dispatch = useAppDispatch();

  const categorySelect = categoryLib.useCategorySelectData();
  const [createProduct] = productApi.useCreateProductMutation();
  const [createNote] = noteApi.useCreateNoteMutation();
  const [updateNote] = noteApi.useUpdateNoteMutation();

  const handleValidateProduct = useCallback(
    (isValid: boolean) => dispatch(actions.draftValidated(isValid)),
    [dispatch],
  );

  const handleCreateProduct = async (formValues: ProductFormValues): Promise<void> => {
    if (!formValues.category) {
      return;
    }

    dispatch(actions.productDraftSaved(formValues));
    await createProduct(toCreateProductRequest(formValues, formValues.category.id));
  };

  const handleSubmitNote = async ({
    id,
    date,
    mealType,
    displayOrder,
    product,
    quantity,
  }: NoteFormValues): Promise<void> => {
    if (!product) {
      throw new Error('Product should not be empty');
    }

    const note = {
      date,
      mealType,
      displayOrder,
      productId: product.id,
      productQuantity: quantity,
    };

    const shouldUpdate = typeof id === 'number';

    if (shouldUpdate) {
      await updateNote({ id, note });
    } else {
      await createNote(note);
    }
  };

  if (!product && productDraft) {
    return (
      <ProductForm
        formId={activeFormId}
        defaultValues={productDraft}
        categories={categorySelect.data}
        categoriesLoading={categorySelect.isLoading}
        onSubmit={handleCreateProduct}
        onValidate={handleValidateProduct}
      />
    );
  }

  if (!product && image) {
    return (
      <>
        <ImagePreview image={image} onRemove={() => dispatch(actions.imageRemoved())} />
        <SearchProductsOnImage image={image} />
      </>
    );
  }

  if (!product) {
    return <SearchProducts />;
  }

  if (!noteDraft) {
    return null;
  }

  return <NoteForm defaultValues={noteDraft} onSubmit={handleSubmitNote} />;
};
