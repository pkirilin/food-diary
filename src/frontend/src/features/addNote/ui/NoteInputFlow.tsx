import { useCallback, type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { noteApi } from '@/entities/note';
import { productApi } from '@/entities/product';
import {
  toCreateProductRequest,
  toEditProductRequest,
  toNoteRequestBody,
  toProductFormValues,
} from '../lib/mapping';
import { type NoteFormValues, actions, selectors } from '../model';
import { type ProductFormValues } from '../model/productSchema';
import { ImagePreview } from './ImagePreview';
import { NoteForm } from './NoteForm';
import { ProductForm } from './ProductForm';
import { SearchProducts } from './SearchProducts';
import { SearchProductsOnImage } from './SearchProductsOnImage';

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
  const [getProductById, { isFetching: loadingProduct }] = productApi.useLazyProductByIdQuery();
  const [createNote] = noteApi.useCreateNoteMutation();
  const [updateNote] = noteApi.useUpdateNoteMutation();

  const handleValidateProduct = useCallback(
    (isValid: boolean) => dispatch(actions.draftValidated(isValid)),
    [dispatch],
  );

  const handleSubmitProduct = async (product: ProductFormValues): Promise<void> => {
    const { id, category } = product;

    if (!category) {
      return;
    }

    dispatch(actions.productDraftSaved(product));

    const shouldUpdate = typeof id === 'number';

    if (shouldUpdate) {
      await editProduct({
        ...toEditProductRequest(product, id, category.id),
        skipNotesRefetching: true,
      });
    } else {
      await createProduct(toCreateProductRequest(product, category.id));
    }
  };

  const handleEditProduct = async (productId: number): Promise<void> => {
    const productByIdQuery = await getProductById(productId);

    if (!productByIdQuery.isSuccess) {
      return;
    }

    const product = toProductFormValues(productByIdQuery.data, productId);

    dispatch(actions.productDraftEditStarted(product));
  };

  const handleSubmitNote = async (formValues: NoteFormValues): Promise<void> => {
    const { id, product } = formValues;

    if (!product) {
      throw new Error('Product should not be empty');
    }

    const note = toNoteRequestBody(formValues, product);
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
      loadingProduct={loadingProduct}
      onSubmit={handleSubmitNote}
      onEditProduct={handleEditProduct}
    />
  );
};
