import { type FC, useEffect, useState, type ReactElement, useCallback } from 'react';
import { type categoryLib } from '@/entities/category';
import { productLib, type productModel } from '@/entities/product';
import { ProductInputDialog } from '@/features/product/addEdit/ui/ProductInputDialog';
import { useToggle } from '@/shared/hooks';
import { type RenderDialogProps } from '../../lib';
import { type Note } from '../../model';

interface Props {
  submitSuccess: boolean;
  product: productModel.AutocompleteOption | null;
  productAutocompleteData: productLib.AutocompleteData;
  categorySelect: categoryLib.CategorySelectData;
  renderTrigger: (onClick: () => void) => ReactElement;
  renderDialog: (props: RenderDialogProps) => ReactElement;
  onSubmit: (note: Note) => Promise<void>;
  onSubmitSuccess: () => void;
}

export const AddOrEditNoteFlow: FC<Props> = ({
  submitSuccess,
  product,
  productAutocompleteData,
  categorySelect,
  renderTrigger,
  renderDialog,
  onSubmit,
  onSubmitSuccess,
}) => {
  const [noteDialogOpened, toggleNoteDialog] = useToggle();
  const [productDialogOpened, toggleProductDialog] = useToggle();

  const [noteSubmitLoading, setNoteSubmitLoading] = useState(false);
  const [noteSubmitDisabled, setNoteSubmitDisabled] = useState(true);

  const productForm = productLib.useFormValues();
  const productAutocompleteInput = productLib.useAutocompleteInput(product);

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
