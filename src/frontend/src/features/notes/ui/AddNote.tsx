import AddIcon from '@mui/icons-material/Add';
import { useCallback, type FC } from 'react';
import { productModel } from '@/entities/product';
import { NoteInputDialog } from '@/features/notes';
import { type CreateProductRequest, productsApi, useCategorySelect } from '@/features/products';
import { useToggle } from '@/shared/hooks';
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
}: productModel.AutocompleteFreeSoloOption): CreateProductRequest => ({
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
  const [dialogOpened, toggleDialog] = useToggle();
  const [createNote, createNoteResponse] = notesApi.useCreateNoteMutation();
  const [createProduct] = productsApi.useCreateProductMutation();
  const { reset: resetCreateNote } = createNoteResponse;
  const notes = useNotes(pageId);
  const productAutocomplete = productModel.useAutocomplete();
  const categorySelect = useCategorySelect();

  const createProductIfNotExists = async (
    product: productModel.AutocompleteOptionType,
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
        productAutocomplete={productAutocomplete}
        categorySelect={categorySelect}
        submitSuccess={createNoteResponse.isSuccess && notes.isChanged}
        onClose={toggleDialog}
        onSubmit={handleSubmit}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </>
  );
};
