import { useMemo, type FC, useEffect, type ReactElement } from 'react';
import { ProductAutocomplete, ProductInputDialog, productsModel } from '@/entities/products';
import { CategorySelect } from '@/features/categories';
import { NoteInputDialog, notesApi, useNotes } from '@/features/notes';
import { useCategorySelect } from '@/features/products';
import { useToggle } from '@/shared/hooks';
import { toEditNoteRequest, toProductSelectOption } from '../mapping';
import { type NoteCreateEdit, type NoteItem } from '../models';

interface Props {
  note: NoteItem;
  pageId: number;
  children: (toggleDialog: () => void) => ReactElement;
}

export const EditNote: FC<Props> = ({ note, pageId, children }) => {
  const notes = useNotes(pageId);
  const product = useMemo(() => toProductSelectOption(note), [note]);
  const [editNote, editNoteResponse] = notesApi.useEditNoteMutation();
  const [dialogOpened, toggleDialog] = useToggle();
  const productAutocomplete = productsModel.useAutocomplete();
  const categorySelect = useCategorySelect();

  useEffect(() => {
    if (editNoteResponse.isSuccess && notes.isChanged) {
      toggleDialog();
    }
  }, [editNoteResponse.isSuccess, notes.isChanged, toggleDialog]);

  const handleSubmit = (formData: NoteCreateEdit): void => {
    const request = toEditNoteRequest(note.id, formData);
    void editNote(request);
  };

  return (
    <>
      {children(toggleDialog)}
      <NoteInputDialog
        title="Edit note"
        submitText="Save"
        isOpened={dialogOpened}
        mealType={note.mealType}
        pageId={pageId}
        product={product}
        quantity={note.productQuantity}
        displayOrder={note.displayOrder}
        submitInProgress={editNoteResponse.isLoading || notes.isFetching}
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
        onClose={toggleDialog}
        onSubmit={handleSubmit}
      />
    </>
  );
};
