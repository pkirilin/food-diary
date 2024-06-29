import AddIcon from '@mui/icons-material/Add';
import { useCallback, type FC } from 'react';
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
  const [addNote, { reset, ...addNoteResponse }] = noteApi.useCreateNoteMutation();
  const addProductIfNotExists = useAddProductIfNotExists();

  const notes = noteLib.useNotes(pageId);
  const noteForm = noteLib.useFormValues({ pageId, mealType, displayOrder, quantity: 100 });

  const categorySelect = categoryLib.useCategorySelectData();
  const productAutocompleteData = productLib.useAutocompleteData();

  const handleSubmit = async (formData: Note): Promise<void> => {
    const productId = await addProductIfNotExists.sendRequest(formData.product);
    const request = mapToCreateNoteRequest(formData, productId);
    await addNote(request).unwrap();
  };

  const handleSubmitSuccess = useCallback(() => {
    reset();
  }, [reset]);

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
      product={null}
      noteFormValues={noteForm.values}
      productAutocompleteData={productAutocompleteData}
      categorySelect={categorySelect}
      onSubmit={handleSubmit}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
};
