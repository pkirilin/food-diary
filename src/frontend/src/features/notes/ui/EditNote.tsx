import { useMemo, type FC, type ReactElement, useCallback } from 'react';
import { productModel } from '@/entities/product';
import { NoteInputDialog, notesApi, useAddProductIfNotExists, useNotes } from '@/features/notes';
import { useCategorySelect } from '@/features/products';
import { useToggle } from '@/shared/hooks';
import { toEditNoteRequest, toProductSelectOption } from '../mapping';
import { type NoteCreateEdit, type NoteItem } from '../models';

interface Props {
  note: NoteItem;
  pageId: number;
  renderTrigger: (openDialog: () => void) => ReactElement;
}

export const EditNote: FC<Props> = ({ note, pageId, renderTrigger }) => {
  const [dialogOpened, toggleDialog] = useToggle();
  const notes = useNotes(pageId);
  const addProductIfNotExists = useAddProductIfNotExists();
  const product = useMemo(() => toProductSelectOption(note), [note]);
  const [editNote, editNoteResponse] = notesApi.useEditNoteMutation();
  const { reset: resetEditNote } = editNoteResponse;
  const productAutocompleteData = productModel.useAutocompleteData();
  const categorySelect = useCategorySelect();

  const handleSubmit = async (formData: NoteCreateEdit): Promise<void> => {
    const productId = await addProductIfNotExists(formData.product);
    const request = toEditNoteRequest(note.id, productId, formData);
    await editNote(request);
  };

  const handleSubmitSuccess = useCallback(() => {
    resetEditNote();
  }, [resetEditNote]);

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
