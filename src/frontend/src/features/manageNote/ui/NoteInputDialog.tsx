import { type FC, type ReactElement } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { type noteModel, type NoteItem } from '@/entities/note';
import { ProductForm } from '@/entities/product';
import { Button, Dialog } from '@/shared/ui';
import { useLoadProductForEdit } from '../lib/useLoadProductForEdit';
import { useSubmitNote } from '../lib/useSubmitNote';
import { useSubmitProduct } from '../lib/useSubmitProduct';
import { actions, selectors } from '../model';
import { ImagePreview } from './ImagePreview';
import { NoteForm } from './NoteForm';
import { ProductSearch } from './ProductSearch';
import { ProductSearchResultsOnImages } from './ProductSearchResultsOnImages';

interface Props {
  date: string;
  mealType: noteModel.MealType;
  note?: NoteItem;
}

export const NoteInputDialog: FC<Props> = ({ date, mealType, note }) => {
  const dialogVisible = useAppSelector(state =>
    note ? selectors.editDialogVisible(state, note) : selectors.addDialogVisible(state, mealType),
  );

  const activeScreen = useAppSelector(selectors.activeScreen);
  const dialogTitle = useAppSelector(selectors.dialogTitle);
  const submitText = useAppSelector(selectors.submitText);
  const submitDisabled = useAppSelector(state => state.manageNote.submitDisabled);
  const isSubmitting = useAppSelector(state => state.manageNote.isSubmitting);
  const dispatch = useAppDispatch();

  const handleSubmitNote = useSubmitNote(date);
  const handleSubmitProduct = useSubmitProduct(date);
  const [handleLoadProductForEdit, productForEditLoading] = useLoadProductForEdit();

  const handleDialogClose = (): void => {
    dispatch(actions.noteDraftDiscarded());
  };

  const handleDiscardProduct = (): void => {
    dispatch(actions.productDraftDiscarded());
  };

  const { categories, categoriesLoading } = categoryLib.useCategoriesForSelect();

  const inputScreenActive =
    activeScreen.type === 'note-input' || activeScreen.type === 'product-input';

  const activeFormId = inputScreenActive ? activeScreen.formId : undefined;

  const renderContent = (): ReactElement => {
    switch (activeScreen.type) {
      case 'product-search':
        return <ProductSearch />;
      case 'note-input':
        return (
          <NoteForm
            formId={activeScreen.formId}
            defaultValues={activeScreen.note}
            productForEditLoading={productForEditLoading}
            isSubmitting={isSubmitting}
            submitDisabled={submitDisabled}
            onSubmit={handleSubmitNote}
            onLoadProductForEdit={handleLoadProductForEdit}
            onDiscardProduct={handleDiscardProduct}
          />
        );
      case 'product-input':
        return (
          <ProductForm
            formId={activeScreen.formId}
            defaultValues={activeScreen.product}
            categories={categories}
            categoriesLoading={categoriesLoading}
            onSubmit={handleSubmitProduct}
          />
        );
      case 'image-upload':
        return (
          <>
            <ImagePreview
              images={activeScreen.images}
              onRemove={() => dispatch(actions.imagesRemoved())}
            />
            <ProductSearchResultsOnImages images={activeScreen.images} />
          </>
        );
    }
  };

  return (
    <Dialog
      pinToTop
      renderMode="fullScreenOnMobile"
      title={dialogTitle}
      opened={dialogVisible}
      onClose={handleDialogClose}
      content={renderContent()}
      renderCancel={props => (
        <Button {...props} type="button" onClick={handleDialogClose}>
          Cancel
        </Button>
      )}
      renderSubmit={props => (
        <Button
          {...props}
          type="submit"
          form={activeFormId}
          disabled={!inputScreenActive || submitDisabled}
          loading={isSubmitting}
        >
          {submitText}
        </Button>
      )}
    />
  );
};
