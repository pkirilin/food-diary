import { useCallback, type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { noteApi } from '@/entities/note';
import { type CreateProductRequest, productApi, type EditProductRequest } from '@/entities/product';
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

export const NoteInputFlow: FC = () => {
  const product = useAppSelector(state => state.addNote.note?.product);
  const noteDraft = useAppSelector(state => state.addNote.note);
  const productDraft = useAppSelector(state => state.addNote.product);
  const image = useAppSelector(state => state.addNote.image);
  const activeFormId = useAppSelector(selectors.activeFormId);
  const dispatch = useAppDispatch();

  const categorySelect = categoryLib.useCategorySelectData();
  const [createProduct] = productApi.useCreateProductMutation();
  const [editProduct] = productApi.useEditProductMutation();
  const [getProductById] = productApi.useLazyProductByIdQuery();
  const [createNote] = noteApi.useCreateNoteMutation();
  const [updateNote] = noteApi.useUpdateNoteMutation();

  const handleValidateProduct = useCallback(
    (isValid: boolean) => dispatch(actions.draftValidated(isValid)),
    [dispatch],
  );

  const handleSubmitProduct = async (formValues: ProductFormValues): Promise<void> => {
    const { id, category } = formValues;

    if (!category) {
      return;
    }

    dispatch(actions.productDraftSaved(formValues));

    const shouldUpdate = typeof id === 'number';

    if (shouldUpdate) {
      await editProduct({
        ...toEditProductRequest(formValues, id, category.id),
        skipNoteInvalidation: true,
      });
    } else {
      await createProduct(toCreateProductRequest(formValues, category.id));
    }
  };

  const handleEditProductStarted = async (productId: number): Promise<void> => {
    const productByIdQuery = await getProductById(productId);

    if (!productByIdQuery.isSuccess) {
      return;
    }

    const { name, defaultQuantity, caloriesCost, category } = productByIdQuery.data;

    dispatch(
      actions.productDraftEditStarted({
        id: productId,
        name,
        defaultQuantity,
        caloriesCost,
        category: {
          id: category.id,
          name: category.name,
        },
      }),
    );
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
        onSubmit={handleSubmitProduct}
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

  return (
    <NoteForm
      defaultValues={noteDraft}
      onSubmit={handleSubmitNote}
      onEditProductStarted={handleEditProductStarted}
    />
  );
};
