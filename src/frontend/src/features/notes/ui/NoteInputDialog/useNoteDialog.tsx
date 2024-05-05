import { useCallback, useState } from 'react';
import { ProductAutocomplete, type productsModel } from '@/entities/products';
import { type UseInputResult } from '@/hooks';
import { type MealType, type NoteCreateEdit } from '../../models';
import { NoteInputForm } from '../NoteInputForm';
import { type DialogState } from './types';

interface Args {
  pageId: number;
  mealType: MealType;
  displayOrder: number;
  title: string;
  submitText: string;
  quantity: number;
  productAutocomplete: productsModel.UseAutocompleteResult;
  productAutocompleteInput: UseInputResult<
    productsModel.AutocompleteOptionType | null,
    productsModel.AutocompleteInputProps
  >;
  productDialogValue: productsModel.ProductFormType;
  onClose: () => void;
  onSubmit: (note: NoteCreateEdit) => Promise<void>;
  onProductChange: (value: productsModel.AutocompleteOptionType | null) => void;
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
  productAutocomplete,
  productAutocompleteInput,
  productDialogValue,
  onClose,
  onSubmit,
  onProductChange,
}: Args): Result => {
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const cancelDisabled = submitLoading;

  const handleSubmit = async (noteValues: NoteCreateEdit): Promise<void> => {
    try {
      setSubmitLoading(true);
      await onSubmit(noteValues);
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
              dialogValue={productDialogValue}
              onChange={onProductChange}
              options={productAutocomplete.options}
              loading={productAutocomplete.isLoading}
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
