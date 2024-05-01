import AddIcon from '@mui/icons-material/Add';
import { useCallback, type FC } from 'react';
import { productsModel } from '@/entities/products';
import { NoteInputDialog } from '@/features/notes';
import { type CreateProductRequest, productsApi, useCategorySelect } from '@/features/products';
import { Button } from '@/shared/ui';
import { notesApi } from '../api';
import { toCreateNoteRequest } from '../mapping';
import { useNotes } from '../model';
import { type NoteCreateEdit, type MealType } from '../models';

const toCreateProductRequest = ({
  name,
  caloriesCost,
  defaultQuantity,
  category,
}: productsModel.AutocompleteFreeSoloOption): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId: category?.id ?? 0,
});

interface Props {
  pageId: number;
  mealType: MealType;
  displayOrder: number;
}

export const AddNote: FC<Props> = ({ pageId, mealType, displayOrder }) => {
  const [createNote, createNoteResponse] = notesApi.useCreateNoteMutation();
  const [createProduct] = productsApi.useCreateProductMutation();
  const { reset: resetCreateNote } = createNoteResponse;
  const notes = useNotes(pageId);
  const productAutocomplete = productsModel.useAutocomplete();
  const categorySelect = useCategorySelect();

  const createProductIfNotExists = async (
    product: productsModel.AutocompleteOptionType,
  ): Promise<number> => {
    if (!product.freeSolo) {
      return product.id;
    }

    const createProductRequest = toCreateProductRequest(product);
    const { id } = await createProduct(createProductRequest).unwrap();
    return id;
  };

  const handleSubmit = async (noteValues: NoteCreateEdit): Promise<void> => {
    const productId = await createProductIfNotExists(noteValues.product);
    const request = toCreateNoteRequest(noteValues, productId);
    await createNote(request);
  };

  const handleSubmitSuccess = useCallback(() => {
    resetCreateNote();
  }, [resetCreateNote]);

  return (
    <NoteInputDialog
      title="New note"
      submitText="Add note"
      pageId={pageId}
      mealType={mealType}
      displayOrder={displayOrder}
      product={null}
      quantity={100}
      renderTrigger={openDialog => (
        <Button variant="text" size="medium" fullWidth startIcon={<AddIcon />} onClick={openDialog}>
          Add note
        </Button>
      )}
      onSubmit={handleSubmit}
      submitSuccess={createNoteResponse.isSuccess && notes.isChanged}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
};
