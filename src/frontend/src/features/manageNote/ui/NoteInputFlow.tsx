import { type FC } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { useLoadProductForEdit } from '../lib/useLoadProductForEdit';
import { useSubmitNote } from '../lib/useSubmitNote';
import { useSubmitProduct } from '../lib/useSubmitProduct';
import { actions, selectors } from '../model';
import { ImagePreview } from './ImagePreview';
import { NoteForm } from './NoteForm';
import { ProductForm } from './ProductForm';
import { SearchProducts } from './SearchProducts';
import { SearchProductsOnImage } from './SearchProductsOnImage';

interface Props {
  date: string;
}

export const NoteInputFlow: FC<Props> = ({ date }) => {
  const product = useAppSelector(state => state.manageNote.note?.product);
  const noteDraft = useAppSelector(state => state.manageNote.note);
  const productDraft = useAppSelector(state => state.manageNote.product);
  const image = useAppSelector(state => state.manageNote.image);
  const activeFormId = useAppSelector(selectors.activeFormId);
  const isSubmitting = useAppSelector(state => state.manageNote.isSubmitting);
  const submitDisabled = useAppSelector(state => state.manageNote.submitDisabled);
  const dispatch = useAppDispatch();

  const categorySelect = categoryLib.useCategorySelectData();

  const handleSubmitNote = useSubmitNote(date);
  const handleSubmitProduct = useSubmitProduct(date);
  const [handleLoadProductForEdit, productForEditLoading] = useLoadProductForEdit();

  if (!product && productDraft) {
    return (
      <ProductForm
        formId={activeFormId}
        defaultValues={productDraft}
        categories={categorySelect.data}
        categoriesLoading={categorySelect.isLoading}
        onSubmit={handleSubmitProduct}
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
      productForEditLoading={productForEditLoading}
      isSubmitting={isSubmitting}
      submitDisabled={submitDisabled}
      onSubmit={handleSubmitNote}
      onLoadProductForEdit={handleLoadProductForEdit}
    />
  );
};
