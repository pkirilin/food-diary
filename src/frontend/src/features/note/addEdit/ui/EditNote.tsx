import { useMemo, type FC, type ReactElement, useCallback } from 'react';
import { categoryLib } from '@/entities/category';
import { type NoteItem, noteApi, noteLib } from '@/entities/note';
import { ProductAutocomplete, productLib } from '@/entities/product';
import { useAddProductIfNotExists, EMPTY_RECOGNIZE_NOTES_RESULT } from '../lib';
import { mapToUpdateNoteRequest, mapToProductSelectOption } from '../lib/mapping';
import { type Note } from '../model';
import { NoteInputFlow } from './NoteInputFlow';
import { NoteInputForm } from './NoteInputForm';

interface Props {
  note: NoteItem;
  renderTrigger: (onClick: () => void) => ReactElement;
}

export const EditNote: FC<Props> = ({ note, renderTrigger }) => {
  const [updateNote, { reset, ...updateNoteResponse }] = noteApi.useUpdateNoteMutation();
  const addProductIfNotExists = useAddProductIfNotExists();

  const notes = noteLib.useNotes(note.date);

  const { clearValues: clearNoteForm, ...noteForm } = noteLib.useFormValues({
    date: note.date,
    mealType: note.mealType,
    displayOrder: note.displayOrder,
    quantity: note.productQuantity,
  });

  const productAutocompleteData = productLib.useAutocompleteData();
  const categorySelect = categoryLib.useCategorySelectData();

  const product = useMemo(() => mapToProductSelectOption(note), [note]);

  const handleSubmit = async (formData: Note): Promise<void> => {
    const productId = await addProductIfNotExists.sendRequest(formData.product);
    const request = mapToUpdateNoteRequest(note.id, productId, formData);
    await updateNote(request).unwrap();
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
      submitSuccess={updateNoteResponse.isSuccess && notes.isChanged}
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
