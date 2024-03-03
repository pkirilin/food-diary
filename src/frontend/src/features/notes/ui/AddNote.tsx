import AddIcon from '@mui/icons-material/Add';
import { useState, type FC, useMemo, useEffect } from 'react';
import { Button } from '@/shared/ui';
import { notesApi } from '../api';
import { toCreateNoteRequest } from '../mapping';
import { useProductSelect, useNotes } from '../model';
import { type NoteCreateEdit, type MealType } from '../models';
import NoteInputDialog from './NoteInputDialog';

interface Props {
  pageId: number;
  mealType: MealType;
}

export const AddNote: FC<Props> = ({ pageId, mealType }) => {
  const [createNote, createNoteResponse] = notesApi.useCreateNoteMutation();
  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const notes = useNotes(pageId);
  const productSelect = useProductSelect();

  const maxDisplayOrderForNotesGroup = useMemo(
    () =>
      notes.data.reduce(
        (maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder),
        -1,
      ),
    [notes],
  );

  useEffect(() => {
    if (createNoteResponse.isSuccess && notes.isChanged) {
      setIsDialogOpened(false);
    }
  }, [createNoteResponse.isSuccess, notes.isChanged]);

  const handleDialogOpen = (): void => {
    setIsDialogOpened(true);
  };

  const handleDialogClose = (): void => {
    setIsDialogOpened(false);
  };

  const handleAddNote = (note: NoteCreateEdit): void => {
    const request = toCreateNoteRequest(note);
    void createNote(request);
  };

  return (
    <>
      <Button
        variant="text"
        size="medium"
        fullWidth
        startIcon={<AddIcon />}
        onClick={handleDialogOpen}
      >
        Add note
      </Button>
      <NoteInputDialog
        title="New note"
        submitText="Create"
        isOpened={isDialogOpened}
        mealType={mealType}
        product={null}
        products={productSelect.data}
        productsLoading={productSelect.isLoading}
        quantity={100}
        pageId={pageId}
        displayOrder={maxDisplayOrderForNotesGroup + 1}
        submitInProgress={createNoteResponse.isLoading || notes.isFetching}
        onClose={handleDialogClose}
        onSubmit={handleAddNote}
      />
    </>
  );
};
