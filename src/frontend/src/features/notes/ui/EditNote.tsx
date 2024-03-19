import { useMemo, type FC, useEffect, useCallback, useState, type ReactElement } from 'react';
import { notesApi, useNotes, useProductSelect } from '@/features/notes';
import { toEditNoteRequest, toProductSelectOption } from '../mapping';
import { type NoteCreateEdit, type NoteItem } from '../models';
import NoteInputDialog from './NoteInputDialog';

interface Props {
  note: NoteItem;
  pageId: number;
  children: (toggleDialog: () => void) => ReactElement;
}

export const EditNote: FC<Props> = ({ note, pageId, children }) => {
  const notes = useNotes(pageId);
  const productSelect = useProductSelect();
  const product = useMemo(() => toProductSelectOption(note), [note]);
  const [editNote, editNoteResponse] = notesApi.useEditNoteMutation();
  const [dialogOpened, setDialogOpened] = useState(false);

  const toggleDialog = useCallback(() => {
    setDialogOpened(value => !value);
  }, []);

  useEffect(() => {
    if (editNoteResponse.isSuccess && notes.isChanged) {
      toggleDialog();
    }
  }, [editNoteResponse.isSuccess, notes.isChanged, toggleDialog]);

  const handleSubmit = (formData: NoteCreateEdit): void => {
    const request = toEditNoteRequest(note.id, formData);
    void editNote(request);
  };

  return (
    <>
      {children(toggleDialog)}
      <NoteInputDialog
        title="Edit note"
        submitText="Save"
        isOpened={dialogOpened}
        mealType={note.mealType}
        pageId={pageId}
        product={product}
        products={productSelect.data}
        productsLoading={productSelect.isLoading}
        quantity={note.productQuantity}
        displayOrder={note.displayOrder}
        submitInProgress={editNoteResponse.isLoading || notes.isFetching}
        onClose={toggleDialog}
        onSubmit={handleSubmit}
      />
    </>
  );
};
