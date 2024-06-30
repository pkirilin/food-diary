import { type FC, useEffect, useState, type ReactElement, useCallback } from 'react';
import { type categoryLib } from '@/entities/category';
import { productLib, type productModel } from '@/entities/product';
import { ProductInputDialog } from '@/features/product/addEdit/ui/ProductInputDialog';
import { useToggle } from '@/shared/hooks';
import { type RecognizeNotesResult, type RenderDialogProps } from '../../lib';
import { type Note } from '../../model';

interface Props {
  submitSuccess: boolean;
  product: productModel.AutocompleteOption | null;
  productAutocompleteData: productLib.AutocompleteData;
  categorySelect: categoryLib.CategorySelectData;
  recognizeNotesResult: RecognizeNotesResult;
  renderTrigger: (onClick: () => void) => ReactElement;
  renderDialog: (props: RenderDialogProps) => ReactElement;
  onCancel: () => void;
  onSubmit: (note: Note) => Promise<void>;
  onSubmitSuccess: () => void;
}

export const AddOrEditNoteFlow: FC<Props> = ({
  submitSuccess,
  product,
  productAutocompleteData,
  categorySelect,
  recognizeNotesResult,
  renderTrigger,
  renderDialog,
  onCancel,
  onSubmit,
  onSubmitSuccess,
}) => {
  const [noteDialogOpened, toggleNoteDialog] = useToggle();
  const [productDialogOpened, toggleProductDialog] = useToggle();

  const [noteSubmitLoading, setNoteSubmitLoading] = useState(false);
  const [noteSubmitDisabled, setNoteSubmitDisabled] = useState(true);

  const productForm = productLib.useFormValues();
  const productAutocompleteInput = productLib.useAutocompleteInput(product);

  const { setValues: setProductFormValues } = productForm;
  const { setValue: setProductAutocompleteValue } = productAutocompleteInput;

  const handleSubmitDisabledChange = useCallback((disabled: boolean): void => {
    setNoteSubmitDisabled(disabled);
  }, []);

  useEffect(() => {
    if (submitSuccess) {
      onSubmitSuccess();
      toggleNoteDialog();
      setNoteSubmitLoading(false);
    }
  }, [onSubmitSuccess, submitSuccess, toggleNoteDialog]);

  useEffect(() => {
    if (recognizeNotesResult.isSuccess) {
      const note = recognizeNotesResult.notes.at(0);
      const category = categorySelect.data.at(0);

      if (!note || !category) {
        handleSubmitDisabledChange(true);
        return;
      }

      handleSubmitDisabledChange(false);

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
    handleSubmitDisabledChange,
    recognizeNotesResult.isSuccess,
    recognizeNotesResult.notes,
    setProductAutocompleteValue,
    setProductFormValues,
  ]);

  const handleTriggerClick = (): void => {
    toggleNoteDialog();
    productAutocompleteInput.clearValue();
    productForm.clearValues();
  };

  const handleNoteSubmit = async (note: Note): Promise<void> => {
    try {
      setNoteSubmitLoading(true);
      onSubmit(note);
    } catch (err) {
      setNoteSubmitLoading(false);
    }
  };

  const handleNoteCancel = (): void => {
    toggleNoteDialog();
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

    toggleNoteDialog();
    toggleProductDialog();
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

        toggleNoteDialog();
        toggleProductDialog();
      });
    }
  };

  const handleProductCancel = (): void => {
    productForm.clearValues();
    toggleNoteDialog();
    toggleProductDialog();
  };

  return (
    <>
      {renderTrigger(handleTriggerClick)}
      {renderDialog({
        opened: noteDialogOpened,
        submitLoading: noteSubmitLoading,
        submitDisabled: noteSubmitDisabled,
        productAutocompleteInput,
        productAutocompleteData,
        productFormValues: productForm.values,
        onClose: handleNoteCancel,
        onSubmit: handleNoteSubmit,
        onSubmitDisabledChange: handleSubmitDisabledChange,
        onProductChange: handleProductChange,
        onProductFormValuesChange: productForm.setValues,
      })}
      <ProductInputDialog
        freeSolo
        opened={productDialogOpened}
        title="New product"
        submitText="Add"
        onClose={handleProductCancel}
        isLoading={false}
        categories={categorySelect.data}
        categoriesLoading={categorySelect.isLoading}
        productFormValues={productForm.values}
        onSubmit={handleProductSubmit}
      />
    </>
  );
};
