import AddIcon from '@mui/icons-material/Add';
import { useCallback, type FC } from 'react';
import { categoryLib } from '@/entities/category';
import { noteApi, type noteModel, noteLib } from '@/entities/note';
import { productLib } from '@/entities/product';
import { useToggle } from '@/shared/hooks';
import { Button } from '@/shared/ui';
import { mapToCreateNoteRequest } from '../lib/mapping';
import { useAddProductIfNotExists } from '../lib/useAddProductIfNotExists';
import { type Note } from '../model';
import { NoteInputDialog } from './NoteInputDialog';

interface Props {
  pageId: number;
  mealType: noteModel.MealType;
  displayOrder: number;
}

export const AddNote: FC<Props> = ({ pageId, mealType, displayOrder }) => {
  const [dialogOpened, toggleDialog] = useToggle();
  const [addNote, addNoteResponse] = noteApi.useCreateNoteMutation();
  const { reset: resetAddNote } = addNoteResponse;
  const addProductIfNotExists = useAddProductIfNotExists();
  const notes = noteLib.useNotes(pageId);
  const productAutocompleteData = productLib.useAutocompleteData();
  const categorySelect = categoryLib.useCategorySelectData();

  const handleSubmit = async (note: Note): Promise<void> => {
    const productId = await addProductIfNotExists(note.product);
    const request = mapToCreateNoteRequest(note, productId);
    await addNote(request);
  };

  const handleSubmitSuccess = useCallback(() => {
    toggleDialog();
    resetAddNote();
  }, [resetAddNote, toggleDialog]);

  return (
    <>
      <Button variant="text" size="medium" fullWidth startIcon={<AddIcon />} onClick={toggleDialog}>
        Add note
      </Button>
      <NoteInputDialog
        opened={dialogOpened}
        title="New note"
        submitText="Add"
        pageId={pageId}
        mealType={mealType}
        displayOrder={displayOrder}
        product={null}
        quantity={100}
        productAutocompleteData={productAutocompleteData}
        categorySelect={categorySelect}
        submitSuccess={addNoteResponse.isSuccess && notes.isChanged}
        onClose={toggleDialog}
        onSubmit={handleSubmit}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </>
  );
};
