import { type ReactElement, type FC, useState, useCallback, useEffect } from 'react';
import { CategorySelect, type categoryLib } from '@/entities/category';
import { type productModel, productLib, ProductInputForm } from '@/entities/product';
import { useToggle } from '@/shared/hooks';
import { Button, Dialog } from '@/shared/ui';
import { type RecognizeNotesResult, type RenderContentProps } from '../../lib';
import { type Note } from '../../model';

type DialogStateType = 'note' | 'product';

interface DialogState {
  form: string;
  title: string;
  content: ReactElement;
  submitText: string;
  submitLoading: boolean;
  submitDisabled: boolean;
  onCancel: () => void;
}

interface Props {
  submitText: string;
  submitSuccess: boolean;
  product: productModel.AutocompleteOption | null;
  productAutocompleteData: productLib.AutocompleteData;
  categorySelect: categoryLib.CategorySelectData;
  recognizeNotesResult: RecognizeNotesResult;
  disableContentPaddingTop?: boolean;
  renderTrigger: (onClick: () => void) => ReactElement;
  renderContent: (props: RenderContentProps) => ReactElement;
  onCancel: () => void;
  onSubmit: (note: Note) => Promise<void>;
  onSubmitSuccess: () => void;
}

export const NoteInputFlow: FC<Props> = ({
  submitText,
  submitSuccess,
  product,
  productAutocompleteData,
  categorySelect,
  recognizeNotesResult,
  disableContentPaddingTop,
  renderTrigger,
  renderContent,
  onCancel,
  onSubmit,
  onSubmitSuccess,
}) => {
  const [dialogOpened, toggleNoteDialog] = useToggle();

  const [dialogStateType, setDialogStateType] = useState<DialogStateType>('note');

  const [noteSubmitLoading, setNoteSubmitLoading] = useState(false);
  const [noteSubmitDisabled, setNoteSubmitDisabled] = useState(true);
  const [productSubmitDisabled, setProductSubmitDisabled] = useState(true);

  const productForm = productLib.useFormValues();
  const productAutocompleteInput = productLib.useAutocompleteInput(product);

  const { setValues: setProductFormValues } = productForm;
  const { setValue: setProductAutocompleteValue, clearValue: clearProductAutocomplete } =
    productAutocompleteInput;

  const handleNoteSubmitDisabledChange = useCallback((disabled: boolean): void => {
    setNoteSubmitDisabled(disabled);
  }, []);

  const handleProductSubmitDisabledChange = useCallback((disabled: boolean): void => {
    setProductSubmitDisabled(disabled);
  }, []);

  useEffect(() => {
    if (submitSuccess) {
      onSubmitSuccess();
      clearProductAutocomplete();
      toggleNoteDialog();
      setNoteSubmitLoading(false);
    }
  }, [clearProductAutocomplete, onSubmitSuccess, submitSuccess, toggleNoteDialog]);

  useEffect(() => {
    if (recognizeNotesResult.isSuccess) {
      const note = recognizeNotesResult.notes.at(0);
      const category = categorySelect.data.at(0);

      if (!note || !category) {
        handleNoteSubmitDisabledChange(true);
        return;
      }

      handleNoteSubmitDisabledChange(false);

      setProductAutocompleteValue({
        freeSolo: true,
        editing: true,
        name: note.product.name,
        caloriesCost: note.product.caloriesCost,
        defaultQuantity: note.quantity,
        category,
      });

      setProductFormValues({
        name: note.product.name,
        caloriesCost: note.product.caloriesCost,
        defaultQuantity: note.quantity,
        category,
      });
    }
  }, [
    categorySelect.data,
    handleNoteSubmitDisabledChange,
    recognizeNotesResult.isSuccess,
    recognizeNotesResult.notes,
    setProductAutocompleteValue,
    setProductFormValues,
  ]);

  const handleNoteSubmit = async (note: Note): Promise<void> => {
    try {
      setNoteSubmitLoading(true);
      await onSubmit(note);
    } catch (err) {
      setNoteSubmitLoading(false);
    }
  };

  const handleNoteCancel = (): void => {
    toggleNoteDialog();
    productAutocompleteInput.clearValue();
    onCancel();
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
    setDialogStateType('note');
  };

  const handleProductCancel = (): void => {
    productForm.clearValues();
    productAutocompleteInput.clearValue();
    setDialogStateType('note');
  };

  const handleProductChange = (value: productModel.AutocompleteOption | null): void => {
    productAutocompleteInput.setValue(value);
    productForm.clearValues();

    if (value?.freeSolo === true) {
      // Timeout to avoid instant validation of the dialog's form
      // Also fixes "Warning: An update to ... inside a test was not wrapped in act(...)" in tests
      setTimeout(() => {
        productForm.setValues({
          name: value.name,
          caloriesCost: value.caloriesCost,
          defaultQuantity: value.defaultQuantity,
          category: value.category,
        });

        setDialogStateType('product');
      });
    }
  };

  const renderNoteContent = (): ReactElement =>
    renderContent({
      submitLoading: noteSubmitLoading,
      submitDisabled: noteSubmitDisabled,
      productAutocompleteInput,
      productAutocompleteData,
      productFormValues: productForm.values,
      onClose: handleNoteCancel,
      onSubmit: handleNoteSubmit,
      onSubmitDisabledChange: handleNoteSubmitDisabledChange,
      onProductChange: handleProductChange,
      onProductFormValuesChange: productForm.setValues,
    });

  const renderProductContent = (form: string): ReactElement => (
    <ProductInputForm
      renderCategoryInput={categoryInputProps => (
        <CategorySelect
          {...categoryInputProps}
          label="Category"
          placeholder="Select a category"
          options={categorySelect.data}
          optionsLoading={categorySelect.isLoading}
        />
      )}
      id={form}
      values={productForm.values}
      touched={productAutocompleteInput.value?.freeSolo}
      onSubmit={handleProductSubmit}
      onSubmitDisabledChange={handleProductSubmitDisabledChange}
    />
  );

  const getDialogState = (): DialogState | null => {
    switch (dialogStateType) {
      case 'note':
        return {
          form: 'note-input-form',
          title: 'New note',
          content: renderNoteContent(),
          submitText,
          submitLoading: noteSubmitLoading,
          submitDisabled: noteSubmitDisabled,
          onCancel: handleNoteCancel,
        };
      case 'product':
        return {
          form: 'product-input-form',
          title: 'Edit product',
          content: renderProductContent('product-input-form'),
          submitText: 'Add',
          submitLoading: false,
          submitDisabled: productSubmitDisabled,
          onCancel: handleProductCancel,
        };
      default:
        return null;
    }
  };

  const dialogState = getDialogState();

  if (!dialogState) {
    return null;
  }

  return (
    <>
      {renderTrigger(toggleNoteDialog)}
      <Dialog
        pinToTop
        renderMode="fullScreenOnMobile"
        disableContentPaddingTop={dialogStateType === 'note' && disableContentPaddingTop}
        disableContentPaddingBottom
        opened={dialogOpened}
        title={dialogState.title}
        content={dialogState.content}
        onClose={dialogState.onCancel}
        renderCancel={cancelProps => (
          <Button
            {...cancelProps}
            type="button"
            disabled={dialogState.submitLoading}
            onClick={dialogState.onCancel}
          >
            Cancel
          </Button>
        )}
        renderSubmit={submitProps => (
          <Button
            {...submitProps}
            type="submit"
            form={dialogState.form}
            disabled={dialogState.submitDisabled}
            loading={dialogState.submitLoading}
          >
            {dialogState.submitText}
          </Button>
        )}
      />
    </>
  );
};
