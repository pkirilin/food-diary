import AddIcon from '@mui/icons-material/Add';
import { useState, type FC, useEffect } from 'react';
import { ProductAutocomplete, ProductInputDialog, productsModel } from '@/entities/products';
import { CategorySelect } from '@/features/categories';
import { useCategorySelect } from '@/features/products';
import { Button } from '@/shared/ui';
import { notesApi } from '../api';
import { toCreateNoteRequest } from '../mapping';
import { useNotes } from '../model';
import { type NoteCreateEdit, type MealType } from '../models';
import { NoteInputDialog } from './NoteInputDialog';

interface Props {
  pageId: number;
  mealType: MealType;
  displayOrder: number;
}

export const AddNote: FC<Props> = ({ pageId, mealType, displayOrder }) => {
  const [createNote, createNoteResponse] = notesApi.useCreateNoteMutation();
  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const notes = useNotes(pageId);
  const productAutocomplete = productsModel.useAutocomplete();
  const categorySelect = useCategorySelect();

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
        quantity={100}
        pageId={pageId}
        displayOrder={displayOrder}
        submitInProgress={createNoteResponse.isLoading || notes.isFetching}
        renderProductAutocomplete={autocompleteProps => (
          <ProductAutocomplete
            {...autocompleteProps}
            options={productAutocomplete.options}
            loading={productAutocomplete.isLoading}
            renderInputDialog={productInputProps => (
              <ProductInputDialog
                {...productInputProps}
                renderCategoryInput={categoryInputProps => (
                  <CategorySelect
                    {...categoryInputProps}
                    label="Category"
                    placeholder="Select a category"
                    options={categorySelect.data}
                    optionsLoading={categorySelect.isLoading}
                  />
                )}
              />
            )}
          />
        )}
        onClose={handleDialogClose}
        onSubmit={handleAddNote}
      />
    </>
  );
};
