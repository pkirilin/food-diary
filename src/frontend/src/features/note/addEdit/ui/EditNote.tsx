import { useMemo, type FC, type ReactElement, useCallback } from 'react';
import { categoryLib } from '@/entities/category';
import { noteApi, noteLib, type noteModel } from '@/entities/note';
import { productLib } from '@/entities/product';
import { useToggle } from '@/shared/hooks';
import { mapToEditNoteRequest, mapToProductSelectOption } from '../lib/mapping';
import { useAddProductIfNotExists } from '../lib/useAddProductIfNotExists';
import { type Note } from '../model';
import { NoteInputDialog } from './NoteInputDialog';

interface Props {
  note: noteModel.NoteItem;
  pageId: number;
  renderTrigger: (openDialog: () => void) => ReactElement;
}

export const EditNote: FC<Props> = ({ note, pageId, renderTrigger }) => {
  const [dialogOpened, toggleDialog] = useToggle();
  const notes = noteLib.useNotes(pageId);
  const addProductIfNotExists = useAddProductIfNotExists();
  const product = useMemo(() => mapToProductSelectOption(note), [note]);
  const [editNote, editNoteResponse] = noteApi.useEditNoteMutation();
  const { reset: resetEditNote } = editNoteResponse;
  const productAutocompleteData = productLib.useAutocompleteData();
  const categorySelect = categoryLib.useCategorySelectData();

  const handleSubmit = async (formData: Note): Promise<void> => {
    const productId = await addProductIfNotExists(formData.product);
    const request = mapToEditNoteRequest(note.id, productId, formData);
    await editNote(request);
  };

  const handleSubmitSuccess = useCallback(() => {
    toggleDialog();
    resetEditNote();
  }, [resetEditNote, toggleDialog]);

  return (
    <>
      {renderTrigger(toggleDialog)}
      <NoteInputDialog
        opened={dialogOpened}
        title="Edit note"
        submitText="Save"
        mealType={note.mealType}
        pageId={pageId}
        product={product}
        quantity={note.productQuantity}
        displayOrder={note.displayOrder}
        productAutocompleteData={productAutocompleteData}
        categorySelect={categorySelect}
        onClose={toggleDialog}
        onSubmit={handleSubmit}
        submitSuccess={editNoteResponse.isSuccess && notes.isChanged}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </>
  );
};
