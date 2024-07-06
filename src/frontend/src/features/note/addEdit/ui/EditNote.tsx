import { useMemo, type FC, type ReactElement, useCallback } from 'react';
import { categoryLib } from '@/entities/category';
import { noteApi, noteLib, type noteModel } from '@/entities/note';
import { ProductAutocomplete, productLib } from '@/entities/product';
import { useAddProductIfNotExists, EMPTY_RECOGNIZE_NOTES_RESULT } from '../lib';
import { mapToEditNoteRequest, mapToProductSelectOption } from '../lib/mapping';
import { type Note } from '../model';
import { NoteInputFlow } from './NoteInputFlow';
import { NoteInputForm } from './NoteInputForm';

interface Props {
  note: noteModel.NoteItem;
  pageId: number;
  renderTrigger: (onClick: () => void) => ReactElement;
}

export const EditNote: FC<Props> = ({ note, pageId, renderTrigger }) => {
  const [editNote, { reset, ...editNoteResponse }] = noteApi.useEditNoteMutation();
  const addProductIfNotExists = useAddProductIfNotExists();

  const notes = noteLib.useNotes(pageId);

  const { clearValues: clearNoteForm, ...noteForm } = noteLib.useFormValues({
    pageId,
    mealType: note.mealType,
    displayOrder: note.displayOrder,
    quantity: note.productQuantity,
  });

  const productAutocompleteData = productLib.useAutocompleteData();
  const categorySelect = categoryLib.useCategorySelectData();

  const product = useMemo(() => mapToProductSelectOption(note), [note]);

  const handleSubmit = async (formData: Note): Promise<void> => {
    const productId = await addProductIfNotExists.sendRequest(formData.product);
    const request = mapToEditNoteRequest(note.id, productId, formData);
    await editNote(request).unwrap();
  };

  const handleSubmitSuccess = useCallback(() => {
    reset();
    clearNoteForm();
  }, [clearNoteForm, reset]);

  const handleCancel = useCallback(() => {
    clearNoteForm();
  }, [clearNoteForm]);

  return (
    <NoteInputFlow
      renderTrigger={renderTrigger}
      renderContent={({
        productAutocompleteInput,
        productFormValues,
        onProductChange,
        onSubmit,
        onSubmitDisabledChange,
      }) => (
        <NoteInputForm
          id="note-input-form"
          values={noteForm.values}
          productAutocompleteInput={productAutocompleteInput}
          renderProductAutocomplete={productAutocompleteProps => (
            <ProductAutocomplete
              {...productAutocompleteProps}
              autoFocus
              formValues={productFormValues}
              onChange={onProductChange}
              options={productAutocompleteData.options}
              loading={productAutocompleteData.isLoading}
            />
          )}
          onSubmit={onSubmit}
          onSubmitDisabledChange={onSubmitDisabledChange}
        />
      )}
      submitText="Save"
      submitSuccess={editNoteResponse.isSuccess && notes.isChanged}
      product={product}
      productAutocompleteData={productAutocompleteData}
      categorySelect={categorySelect}
      recognizeNotesResult={EMPTY_RECOGNIZE_NOTES_RESULT}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
};
