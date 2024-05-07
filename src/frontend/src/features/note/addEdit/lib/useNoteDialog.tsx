import { useCallback, useState } from 'react';
import { type noteModel } from '@/entities/note';
import { ProductAutocomplete, type productLib, type productModel } from '@/entities/product';
import { type Note, type DialogState } from '../model';
import { NoteInputForm } from '../ui/NoteInputForm';

interface Args {
  pageId: number;
  mealType: noteModel.MealType;
  displayOrder: number;
  title: string;
  submitText: string;
  quantity: number;
  productAutocompleteData: productLib.AutocompleteData;
  productAutocompleteInput: productLib.AutocompleteInput;
  productFormValues: productModel.FormValues;
  onClose: () => void;
  onSubmit: (note: Note) => Promise<void>;
  onProductChange: (value: productModel.AutocompleteOption | null) => void;
}

interface Result {
  state: DialogState;
  onSubmitSuccess: () => void;
}

export const useNoteDialog = ({
  pageId,
  mealType,
  displayOrder,
  title,
  submitText,
  quantity,
  productAutocompleteData,
  productAutocompleteInput,
  productFormValues,
  onClose,
  onSubmit,
  onProductChange,
}: Args): Result => {
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const cancelDisabled = submitLoading;

  const handleSubmit = async (note: Note): Promise<void> => {
    try {
      setSubmitLoading(true);
      await onSubmit(note);
    } catch (err) {
      setSubmitLoading(false);
    }
  };

  const handleSubmitDisabledChange = useCallback((disabled: boolean): void => {
    setSubmitDisabled(disabled);
  }, []);

  const handleSubmitSuccess = useCallback((): void => {
    setSubmitLoading(false);
  }, []);

  return {
    state: {
      type: 'note',
      title,
      submitText,
      formId: 'note-form',
      submitLoading,
      submitDisabled,
      cancelDisabled,
      content: (
        <NoteInputForm
          id="note-form"
          pageId={pageId}
          mealType={mealType}
          displayOrder={displayOrder}
          productAutocompleteInput={productAutocompleteInput}
          quantity={quantity}
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
          onSubmit={handleSubmit}
          onSubmitDisabledChange={handleSubmitDisabledChange}
        />
      ),
      onClose,
    },
    onSubmitSuccess: handleSubmitSuccess,
  };
};
