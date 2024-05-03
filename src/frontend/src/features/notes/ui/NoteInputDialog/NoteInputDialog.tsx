import { type FC, useEffect, useCallback, useMemo, useState } from 'react';
import {
  productsModel,
  ProductInputForm,
  ProductAutocompleteWithoutDialog,
} from '@/entities/products';
import { CategorySelect } from '@/features/categories';
import { type UseCategorySelectResult } from '@/features/products';
import { Button, Dialog } from '@/shared/ui';
import { useInput } from 'src/hooks';
import { mapToTextInputProps } from 'src/utils/inputMapping';
import { validateProductName } from 'src/utils/validation';
import { type MealType, type NoteCreateEdit } from '../../models';
import { NoteInputForm } from '../NoteInputForm';

const EMPTY_DIALOG_VALUE: productsModel.ProductFormType = {
  name: '',
  defaultQuantity: 100,
  caloriesCost: 100,
  category: null,
};

type InputDialogStateType = 'note' | 'product';

interface InputDialogState {
  type: InputDialogStateType;
  title: string;
  submitText: string;
  submitLoading: boolean;
  submitDisabled: boolean;
  cancelDisabled: boolean;
  formId: string;
  handleClose: () => void;
}

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
  quantity,
  displayOrder,
  productAutocomplete,
  categorySelect,
  submitSuccess,
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

  const [currentInputDialogType, setCurrentInputDialogType] =
    useState<InputDialogStateType>('note');

  const [noteSubmitDisabled, setNoteSubmitDisabled] = useState(true);
  const [noteSubmitLoading, setNoteSubmitLoading] = useState(false);
  const [productSubmitDisabled, setProductSubmitDisabled] = useState(true);

  const inputDialogStates = useMemo<InputDialogState[]>(
    () => [
      {
        type: 'note',
        title,
        submitText,
        formId: 'note-form',
        submitLoading: noteSubmitLoading,
        submitDisabled: noteSubmitDisabled,
        cancelDisabled: noteSubmitLoading,
        handleClose: () => {
          onClose();
          setProductDialogValue(EMPTY_DIALOG_VALUE);
          clearProductAutocompleteValue();
        },
      },
      {
        type: 'product',
        title: 'New product',
        submitText: 'Add product',
        submitLoading: false,
        submitDisabled: productSubmitDisabled,
        cancelDisabled: false,
        formId: 'product-form',
        handleClose: () => {
          setCurrentInputDialogType('note');
        },
      },
    ],
    [
      title,
      submitText,
      noteSubmitLoading,
      noteSubmitDisabled,
      productSubmitDisabled,
      clearProductAutocompleteValue,
      onClose,
    ],
  );

  const currentInputDialogState = useMemo(
    () => inputDialogStates.find(s => s.type === currentInputDialogType),
    [currentInputDialogType, inputDialogStates],
  );

  useEffect(() => {
    if (opened && submitSuccess) {
      onClose();
      setProductDialogValue(EMPTY_DIALOG_VALUE);
      clearProductAutocompleteValue();
      setNoteSubmitLoading(false);
      onSubmitSuccess();
    }
  }, [clearProductAutocompleteValue, opened, onSubmitSuccess, submitSuccess, onClose]);

  const handleNoteInputFormProductChange = (
    value: productsModel.AutocompleteOptionType | null,
  ): void => {
    setProductAutocompleteValue(value);

    if (value === null || !value.freeSolo) {
      return;
    }

    setCurrentInputDialogType('product');

    setProductDialogValue({
      name: value.name,
      caloriesCost: value.caloriesCost,
      defaultQuantity: value.defaultQuantity,
      category: value.category,
    });

    productNameInput.setValue(value.name);
  };

  const handleNoteInputFormSubmit = async (noteValues: NoteCreateEdit): Promise<void> => {
    try {
      setNoteSubmitLoading(true);
      await onSubmit(noteValues);
    } catch (err) {
      setNoteSubmitLoading(false);
    }
  };

  const handleNoteInputFormSubmitDisabledChange = useCallback((disabled: boolean): void => {
    setNoteSubmitDisabled(disabled);
  }, []);

  const handleProductInputFormSubmit = async ({
    name,
    caloriesCost,
    defaultQuantity,
    category,
  }: productsModel.ProductFormType): Promise<void> => {
    setProductAutocompleteValue({
      freeSolo: true,
      editing: true,
      name,
      caloriesCost,
      defaultQuantity,
      category,
    });
    setCurrentInputDialogType('note');
  };

  const handleProductInputFormSubmitDisabledChange = useCallback((disabled: boolean): void => {
    setProductSubmitDisabled(disabled);
  }, []);

  return (
    <>
      {currentInputDialogState && (
        <Dialog
          renderMode="fullScreenOnMobile"
          title={currentInputDialogState.title}
          opened={opened}
          onClose={currentInputDialogState.handleClose}
          content={(() => {
            switch (currentInputDialogState.type) {
              case 'note':
                return (
                  <NoteInputForm
                    id={currentInputDialogState.formId}
                    pageId={pageId}
                    mealType={mealType}
                    displayOrder={displayOrder}
                    productAutocompleteInput={productAutocompleteInput}
                    quantity={quantity}
                    renderProductAutocomplete={productAutocompleteProps => (
                      <ProductAutocompleteWithoutDialog
                        {...productAutocompleteProps}
                        autoFocus
                        dialogValue={productDialogValue}
                        onChange={handleNoteInputFormProductChange}
                        options={productAutocomplete.options}
                        loading={productAutocomplete.isLoading}
                      />
                    )}
                    onSubmit={handleNoteInputFormSubmit}
                    onSubmitDisabledChange={handleNoteInputFormSubmitDisabledChange}
                  />
                );
              case 'product':
                return (
                  <ProductInputForm
                    id={currentInputDialogState.formId}
                    product={productDialogValue}
                    productNameInput={productNameInput}
                    renderCategoryInput={categoryInputProps => (
                      <CategorySelect
                        {...categoryInputProps}
                        label="Category"
                        placeholder="Select a category"
                        options={categorySelect.data}
                        optionsLoading={categorySelect.isLoading}
                      />
                    )}
                    onSubmit={handleProductInputFormSubmit}
                    onSubmitDisabledChange={handleProductInputFormSubmitDisabledChange}
                  />
                );
              default:
                return <></>;
            }
          })()}
          renderCancel={cancelProps => (
            <Button
              {...cancelProps}
              type="button"
              onClick={currentInputDialogState.handleClose}
              disabled={currentInputDialogState.cancelDisabled}
            >
              Cancel
            </Button>
          )}
          renderSubmit={submitProps => (
            <Button
              {...submitProps}
              type="submit"
              form={currentInputDialogState.formId}
              disabled={currentInputDialogState.submitDisabled}
              loading={currentInputDialogState.submitLoading}
            >
              {currentInputDialogState.submitText}
            </Button>
          )}
        />
      )}
    </>
  );
};
