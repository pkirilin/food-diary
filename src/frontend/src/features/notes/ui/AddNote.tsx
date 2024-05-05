import AddIcon from '@mui/icons-material/Add';
import { useCallback, type FC } from 'react';
import { productModel } from '@/entities/product';
import { NoteInputDialog } from '@/features/notes';
import { useCategorySelect } from '@/features/products';
import { useToggle } from '@/shared/hooks';
import { Button } from '@/shared/ui';
import { notesApi } from '../api';
import { toCreateNoteRequest } from '../mapping';
import { useNotes, useAddProductIfNotExists } from '../model';
import { type NoteCreateEdit, type MealType } from '../models';

interface Props {
  pageId: number;
  mealType: MealType;
  displayOrder: number;
}

export const AddNote: FC<Props> = ({ pageId, mealType, displayOrder }) => {
  const [dialogOpened, toggleDialog] = useToggle();
  const [createNote, createNoteResponse] = notesApi.useCreateNoteMutation();
  const { reset: resetCreateNote } = createNoteResponse;
  const notes = useNotes(pageId);
  const addProductIfNotExists = useAddProductIfNotExists();
  const productAutocompleteData = productModel.useAutocompleteData();
  const categorySelect = useCategorySelect();

  const handleSubmit = async (noteValues: NoteCreateEdit): Promise<void> => {
    const productId = await addProductIfNotExists(noteValues.product);
    const request = toCreateNoteRequest(noteValues, productId);
    await createNote(request);
  };

  const handleSubmitSuccess = useCallback(() => {
    resetCreateNote();
  }, [resetCreateNote]);

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
        submitSuccess={createNoteResponse.isSuccess && notes.isChanged}
        onClose={toggleDialog}
        onSubmit={handleSubmit}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </>
  );
};
