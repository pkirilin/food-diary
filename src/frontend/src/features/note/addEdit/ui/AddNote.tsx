import AddIcon from '@mui/icons-material/Add';
import { type FC } from 'react';
import { categoryLib } from '@/entities/category';
import { noteApi, type noteModel, noteLib } from '@/entities/note';
import { productLib } from '@/entities/product';
import { Button } from '@/shared/ui';
import { useAddProductIfNotExists } from '../lib';
import { mapToCreateNoteRequest } from '../lib/mapping';
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

  const handleSubmit = async (formData: Note): Promise<void> => {
    const productId = await addProductIfNotExists.sendRequest(formData.product);
    const request = mapToCreateNoteRequest(formData, productId);
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
      submitSuccess={addNoteResponse.isSuccess && notes.isChanged}
      pageId={pageId}
      mealType={mealType}
      displayOrder={displayOrder}
      product={null}
      quantity={100}
      productAutocompleteData={productAutocompleteData}
      categorySelect={categorySelect}
      onSubmit={handleSubmit}
    />
  );
};
