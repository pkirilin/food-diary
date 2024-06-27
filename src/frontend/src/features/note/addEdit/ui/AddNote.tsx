import AddIcon from '@mui/icons-material/Add';
import { type FC } from 'react';
import { categoryLib } from '@/entities/category';
import { noteApi, type noteModel, noteLib } from '@/entities/note';
import { productLib } from '@/entities/product';
import { Button } from '@/shared/ui';
import { mapToCreateNoteRequest } from '../lib/mapping';
import { useAddProductIfNotExists } from '../lib/useAddProductIfNotExists';
import { type Note } from '../model';
import { AddOrEditNoteFlow } from './AddOrEditNoteFlow';

interface Props {
  pageId: number;
  mealType: noteModel.MealType;
  displayOrder: number;
}

export const AddNote: FC<Props> = ({ pageId, mealType, displayOrder }) => {
  const [addNote, addNoteResponse] = noteApi.useCreateNoteMutation();
  const addProductIfNotExists = useAddProductIfNotExists();

  const notes = noteLib.useNotes(pageId);
  const categorySelect = categoryLib.useCategorySelectData();
  const productAutocompleteData = productLib.useAutocompleteData();

  const handleNoteSubmit = async (note: Note): Promise<void> => {
    const productId = await addProductIfNotExists.sendRequest(note.product);
    const request = mapToCreateNoteRequest(note, productId);
    await addNote(request).unwrap();
  };

  return (
    <AddOrEditNoteFlow
      renderTrigger={handleAddNoteClick => (
        <Button
          variant="text"
          size="medium"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleAddNoteClick}
        >
          Add note
        </Button>
      )}
      dialogTitle="New note"
      submitText="Add"
      pageId={pageId}
      mealType={mealType}
      displayOrder={displayOrder}
      submitSuccess={addNoteResponse.isSuccess && notes.isChanged}
      productAutocompleteData={productAutocompleteData}
      categorySelect={categorySelect}
      onSubmit={handleNoteSubmit}
    />
  );
};
