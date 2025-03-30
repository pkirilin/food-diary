import { useCallback, type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { productApi } from '@/entities/product';
import { toProductFormValues } from '../lib/mapping';
import { useSubmitNote } from '../lib/useSubmitNote';
import { useSubmitProduct } from '../lib/useSubmitProduct';
import { actions, selectors } from '../model';
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
  const [getProductById, { isFetching: loadingProduct }] = productApi.useLazyProductByIdQuery();

  const handleSubmitNote = useSubmitNote();
  const handleSubmitProduct = useSubmitProduct();

  const handleValidateProduct = useCallback(
    (isValid: boolean) => dispatch(actions.draftValidated(isValid)),
    [dispatch],
  );

  const handleEditProduct = async (productId: number): Promise<void> => {
    const productByIdQuery = await getProductById(productId);

    if (!productByIdQuery.isSuccess) {
      return;
    }

    const product = toProductFormValues(productByIdQuery.data, productId);

    dispatch(actions.productDraftEditStarted(product));
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
