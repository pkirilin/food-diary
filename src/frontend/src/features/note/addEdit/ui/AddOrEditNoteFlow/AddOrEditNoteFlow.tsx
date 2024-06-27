import { type FC, useEffect, useState, type ReactElement } from 'react';
import { type categoryLib } from '@/entities/category';
import { type noteModel } from '@/entities/note';
import { productLib, type productModel } from '@/entities/product';
import { ProductInputDialog } from '@/features/product/addEdit/ui/ProductInputDialog';
import { useToggle } from '@/shared/hooks';
import { type Note } from '../../model';
import { NoteInputDialogV2 } from '../NoteInputDialogV2';

interface Props {
  dialogTitle: string;
  submitText: string;
  submitSuccess: boolean;
  pageId: number;
  mealType: noteModel.MealType;
  displayOrder: number;
  product: productModel.AutocompleteOption | null;
  quantity: number;
  productAutocompleteData: productLib.AutocompleteData;
  categorySelect: categoryLib.CategorySelectData;
  renderTrigger: (onClick: () => void) => ReactElement;
  onSubmit: (note: Note) => Promise<void>;
}

export const AddOrEditNoteFlow: FC<Props> = ({
  pageId,
  mealType,
  displayOrder,
  dialogTitle,
  submitText,
  submitSuccess,
  product,
  quantity,
  productAutocompleteData,
  categorySelect,
  renderTrigger,
  onSubmit,
}) => {
  const [noteDialogOpened, toggleNoteDialog] = useToggle();
  const [productDialogOpened, toggleProductDialog] = useToggle();
  const [noteSubmitLoading, setNoteSubmitLoading] = useState(false);
  const productForm = productLib.useFormValues();
  const productAutocompleteInput = productLib.useAutocompleteInput(product);

  useEffect(() => {
    if (submitSuccess) {
      toggleNoteDialog();
      setNoteSubmitLoading(false);
    }
  }, [submitSuccess, toggleNoteDialog]);

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
      productForm.setValues({
        name: value.name,
        caloriesCost: value.caloriesCost,
        defaultQuantity: value.defaultQuantity,
        category: value.category,
      });

      toggleNoteDialog();
      toggleProductDialog();
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
      <NoteInputDialogV2
        opened={noteDialogOpened}
        title={dialogTitle}
        submitText={submitText}
        submitLoading={noteSubmitLoading}
        pageId={pageId}
        mealType={mealType}
        displayOrder={displayOrder}
        quantity={quantity}
        productAutocompleteData={productAutocompleteData}
        productAutocompleteInput={productAutocompleteInput}
        productFormValues={productForm.values}
        onClose={handleNoteCancel}
        onSubmit={handleNoteSubmit}
        onProductChange={handleProductChange}
      />
      <ProductInputDialog
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
