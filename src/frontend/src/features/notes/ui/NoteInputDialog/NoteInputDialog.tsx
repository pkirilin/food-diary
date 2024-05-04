import { type FC, useEffect, useState } from 'react';
import { productsModel } from '@/entities/products';
import { type UseCategorySelectResult } from '@/features/products';
import { Button, Dialog } from '@/shared/ui';
import { useInput } from 'src/hooks';
import { mapToTextInputProps } from 'src/utils/inputMapping';
import { validateProductName } from 'src/utils/validation';
import { type MealType, type NoteCreateEdit } from '../../models';
import { type DialogState, type DialogStateType } from './types';
import { useNoteDialog } from './useNoteDialog';
import { useProductDialog } from './useProductDialog';

const EMPTY_DIALOG_VALUE: productsModel.ProductFormType = {
  name: '',
  defaultQuantity: 100,
  caloriesCost: 100,
  category: null,
};

interface Props {
  opened: boolean;
  title: string;
  submitText: string;
  mealType: MealType;
  pageId: number;
  product: productsModel.AutocompleteOptionType | null;
  quantity: number;
  displayOrder: number;
  productAutocomplete: productsModel.UseAutocompleteResult;
  categorySelect: UseCategorySelectResult;
  submitSuccess: boolean;
  onClose: () => void;
  onSubmit: (note: NoteCreateEdit) => Promise<void>;
  onSubmitSuccess: () => void;
}

export const NoteInputDialog: FC<Props> = ({
  opened,
  title,
  submitText,
  mealType,
  pageId,
  product,
  displayOrder,
  categorySelect,
  submitSuccess,
  quantity,
  productAutocomplete,
  onClose,
  onSubmit,
  onSubmitSuccess,
}) => {
  const productAutocompleteInput = useInput({
    initialValue: product,
    errorHelperText: 'Product is required',
    validate: productsModel.validateAutocompleteInput,
    mapToInputProps: productsModel.mapToAutocompleteProps,
  });

  const productNameInput = useInput({
    initialValue: '',
    errorHelperText: 'Product name is invalid',
    validate: validateProductName,
    mapToInputProps: mapToTextInputProps,
  });

  const { setValue: setProductAutocompleteValue, clearValue: clearProductAutocompleteValue } =
    productAutocompleteInput;

  const [productDialogValue, setProductDialogValue] =
    useState<productsModel.ProductFormType>(EMPTY_DIALOG_VALUE);

  const [currentInputDialogType, setCurrentInputDialogType] = useState<DialogStateType>('note');

  const { state: noteDialogState, onSubmitSuccess: onNoteSubmitSuccess } = useNoteDialog({
    pageId,
    mealType,
    displayOrder,
    title,
    submitText,
    quantity,
    productAutocomplete,
    productAutocompleteInput,
    productDialogValue,
    onSubmit,
    onClose: () => {
      onClose();
      setProductDialogValue(EMPTY_DIALOG_VALUE);
      clearProductAutocompleteValue();
    },
    onProductChange: value => {
      setProductAutocompleteValue(value);

      if (value?.freeSolo === true) {
        setCurrentInputDialogType('product');

        setProductDialogValue({
          name: value.name,
          caloriesCost: value.caloriesCost,
          defaultQuantity: value.defaultQuantity,
          category: value.category,
        });

        productNameInput.setValue(value.name);
      }
    },
  });

  const { state: productDialogState } = useProductDialog({
    productDialogValue,
    productNameInput,
    categorySelect,
    onClose: () => {
      setCurrentInputDialogType('note');
    },
    onSubmit: ({ name, caloriesCost, defaultQuantity, category }) => {
      setProductAutocompleteValue({
        freeSolo: true,
        editing: true,
        name,
        caloriesCost,
        defaultQuantity,
        category,
      });
      setCurrentInputDialogType('note');
    },
  });

  useEffect(() => {
    if (opened && submitSuccess) {
      onClose();
      setProductDialogValue(EMPTY_DIALOG_VALUE);
      clearProductAutocompleteValue();
      onSubmitSuccess();
      onNoteSubmitSuccess();
    }
  }, [
    opened,
    onClose,
    submitSuccess,
    onSubmitSuccess,
    onNoteSubmitSuccess,
    clearProductAutocompleteValue,
  ]);

  const dialogStates: DialogState[] = [noteDialogState, productDialogState];

  const currentDialogState = dialogStates.find(s => s.type === currentInputDialogType);

  if (!currentDialogState) {
    return null;
  }

  return (
    <Dialog
      renderMode="fullScreenOnMobile"
      opened={opened}
      title={currentDialogState.title}
      content={currentDialogState.content}
      onClose={currentDialogState.onClose}
      renderCancel={cancelProps => (
        <Button
          {...cancelProps}
          type="button"
          disabled={currentDialogState.cancelDisabled}
          onClick={currentDialogState.onClose}
        >
          Cancel
        </Button>
      )}
      renderSubmit={submitProps => (
        <Button
          {...submitProps}
          type="submit"
          form={currentDialogState.formId}
          disabled={currentDialogState.submitDisabled}
          loading={currentDialogState.submitLoading}
        >
          {currentDialogState.submitText}
        </Button>
      )}
    />
  );
};
