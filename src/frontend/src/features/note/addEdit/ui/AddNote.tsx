import AddIcon from '@mui/icons-material/Add';
import { type FC, useEffect, useState } from 'react';
import { categoryLib } from '@/entities/category';
import { noteApi, type noteModel, noteLib } from '@/entities/note';
import { productLib, type productModel } from '@/entities/product';
import { ProductInputDialog } from '@/features/product/addEdit/ui/ProductInputDialog';
import { useToggle } from '@/shared/hooks';
import { Button } from '@/shared/ui';
import { mapToCreateNoteRequest } from '../lib/mapping';
import { useAddProductIfNotExists } from '../lib/useAddProductIfNotExists';
import { type Note } from '../model';
import { NoteInputDialogV2 } from './NoteInputDialog/NoteInputDialogV2';

interface Props {
  pageId: number;
  mealType: noteModel.MealType;
  displayOrder: number;
}

export const AddNote: FC<Props> = ({ pageId, mealType, displayOrder }) => {
  const [noteDialogOpened, toggleNoteDialog] = useToggle();
  const [productDialogOpened, toggleProductDialog] = useToggle();

  const [noteSubmitLoading, setNoteSubmitLoading] = useState(false);

  const [addNote, addNoteResponse] = noteApi.useCreateNoteMutation();
  const addProductIfNotExists = useAddProductIfNotExists();

  const notes = noteLib.useNotes(pageId);
  const categorySelect = categoryLib.useCategorySelectData();

  const productForm = productLib.useFormValues();
  const productAutocompleteInput = productLib.useAutocompleteInput(null);
  const productAutocompleteData = productLib.useAutocompleteData();

  useEffect(() => {
    if (addNoteResponse.isSuccess && notes.isChanged) {
      toggleNoteDialog();
      setNoteSubmitLoading(false);
    }
  }, [addNoteResponse.isSuccess, notes.isChanged, toggleNoteDialog]);

  const handleAddNoteClick = (): void => {
    toggleNoteDialog();
    productAutocompleteInput.clearValue();
    productForm.clearValues();
  };

  const handleNoteSubmit = async (note: Note): Promise<void> => {
    try {
      setNoteSubmitLoading(true);
      const productId = await addProductIfNotExists.sendRequest(note.product);
      const request = mapToCreateNoteRequest(note, productId);
      await addNote(request).unwrap();
    } catch (err) {
      setNoteSubmitLoading(false);
    }
  };

  const handleNoteCancel = (): void => {
    toggleNoteDialog();
  };

  const handleProductSubmit = (product: productModel.FormValues): void => {
    const { name, caloriesCost, defaultQuantity, category } = product;

    productAutocompleteInput.setValue({
      freeSolo: true,
      editing: true,
      name,
      caloriesCost,
      defaultQuantity,
      category,
    });

    productForm.setValues(product);

    toggleNoteDialog();
    toggleProductDialog();
  };

  const handleProductChange = (value: productModel.AutocompleteOption | null): void => {
    productAutocompleteInput.setValue(value);
    productForm.clearValues();

    if (value?.freeSolo === true) {
      productForm.setValues({
        name: value.name,
        caloriesCost: value.caloriesCost,
        defaultQuantity: value.defaultQuantity,
        category: value.category,
      });

      toggleNoteDialog();
      toggleProductDialog();
    }
  };

  const handleProductCancel = (): void => {
    productForm.clearValues();
    toggleNoteDialog();
    toggleProductDialog();
  };

  return (
    <>
      <Button
        variant="text"
        size="medium"
        fullWidth
        startIcon={<AddIcon />}
        onClick={handleAddNoteClick}
      >
        Add note
      </Button>
      <NoteInputDialogV2
        opened={noteDialogOpened}
        title="New note"
        submitText="Add"
        submitLoading={noteSubmitLoading}
        pageId={pageId}
        mealType={mealType}
        displayOrder={displayOrder}
        quantity={100}
        productAutocompleteData={productAutocompleteData}
        productAutocompleteInput={productAutocompleteInput}
        productFormValues={productForm.values}
        onClose={handleNoteCancel}
        onSubmit={handleNoteSubmit}
        onProductChange={handleProductChange}
      />
      <ProductInputDialog
        opened={productDialogOpened}
        title="New product"
        submitText="Add"
        onClose={handleProductCancel}
        isLoading={addNoteResponse.isLoading}
        categories={categorySelect.data}
        categoriesLoading={categorySelect.isLoading}
        productFormValues={productForm.values}
        onSubmit={handleProductSubmit}
      />
    </>
  );
};
