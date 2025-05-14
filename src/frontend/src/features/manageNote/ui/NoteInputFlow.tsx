import { type FC, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { useLoadProductForEdit } from '../lib/useLoadProductForEdit';
import { useSubmitNote } from '../lib/useSubmitNote';
import { useSubmitProduct } from '../lib/useSubmitProduct';
import { actions, selectors } from '../model';
import { ImagePreview } from './ImagePreview';
import { NoteForm } from './NoteForm';
import { ProductForm } from './ProductForm';
import { ProductSearch } from './ProductSearch';
import { ProductSearchResultsOnImage } from './ProductSearchResultsOnImage';

interface Props {
  date: string;
}

export const NoteInputFlow: FC<Props> = ({ date }) => {
  const activeScreen = useAppSelector(selectors.activeScreen);
  const isSubmitting = useAppSelector(state => state.manageNote.isSubmitting);
  const submitDisabled = useAppSelector(state => state.manageNote.submitDisabled);
  const dispatch = useAppDispatch();

  const categorySelect = categoryLib.useCategorySelectData();

  const handleSubmitNote = useSubmitNote(date);
  const handleSubmitProduct = useSubmitProduct(date);
  const [handleLoadProductForEdit, productForEditLoading] = useLoadProductForEdit();

  const renderActiveScreen = (): ReactNode => {
    switch (activeScreen.type) {
      case 'product-search':
        return <ProductSearch />;
      case 'note-input':
        return (
          <NoteForm
            defaultValues={activeScreen.note}
            productForEditLoading={productForEditLoading}
            isSubmitting={isSubmitting}
            submitDisabled={submitDisabled}
            onSubmit={handleSubmitNote}
            onLoadProductForEdit={handleLoadProductForEdit}
          />
        );
      case 'product-input':
        return (
          <ProductForm
            formId={activeScreen.formId}
            defaultValues={activeScreen.product}
            categories={categorySelect.data}
            categoriesLoading={categorySelect.isLoading}
            onSubmit={handleSubmitProduct}
          />
        );
      case 'image-upload':
        return (
          <>
            <ImagePreview
              image={activeScreen.image}
              onRemove={() => dispatch(actions.imageRemoved())}
            />
            <ProductSearchResultsOnImage image={activeScreen.image} />
          </>
        );
      default:
        return null;
    }
  };

  return renderActiveScreen();
};
