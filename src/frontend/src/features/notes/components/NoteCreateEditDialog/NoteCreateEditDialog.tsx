import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { useAppSelector, useValidatedNumericInput } from 'src/features/__shared__/hooks';
import { DialogCustomActionProps } from 'src/features/__shared__/types';
import { MealType, NoteCreateEdit, NoteItem } from 'src/features/notes/models';
import { ProductSelect } from 'src/features/products';
import { useInput } from 'src/hooks';
import { SelectOption } from 'src/types';
import { mapToSelectProps } from 'src/utils/inputMapping';
import { validateSelectOption } from 'src/utils/validation';

interface NoteCreateEditDialogProps extends DialogProps, DialogCustomActionProps<NoteCreateEdit> {
  mealType: MealType;
  pageId: number;
  note?: NoteItem;
}

function useInitialProduct(note?: NoteItem) {
  const isNewNote = !note;

  return useMemo<SelectOption | null>(() => {
    if (isNewNote) {
      return null;
    }

    return {
      id: note.productId,
      name: note.productName,
    };
  }, [isNewNote, note]);
}

function useDisplayOrder(mealType: MealType, note?: NoteItem) {
  const maxDisplayOrderForNotesGroup = useAppSelector(state =>
    state.notes.noteItems
      .filter(note => note.mealType === mealType)
      .reduce(
        (maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder),
        -1,
      ),
  );

  const isNewNote = !note;

  return isNewNote ? maxDisplayOrderForNotesGroup + 1 : note.displayOrder;
}

const NoteCreateEditDialog: React.FC<NoteCreateEditDialogProps> = ({
  mealType,
  pageId,
  note,
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}) => {
  const isNewNote = !note;
  const displayOrder = useDisplayOrder(mealType, note);
  const initialProduct = useInitialProduct(note);
  const initialQuantity = isNewNote ? 100 : note.productQuantity;
  const title = isNewNote ? 'New note' : 'Edit note';
  const submitText = isNewNote ? 'Create' : 'Save';

  const {
    inputProps: productSelectProps,
    value: product,
    clearValue: clearProduct,
  } = useInput({
    initialValue: initialProduct,
    errorHelperText: 'Product is required',
    validate: validateSelectOption,
    mapToInputProps: mapToSelectProps,
  });

  const [quantity, setQuantity, bindQuantity, isValidQuantity] = useValidatedNumericInput(
    initialQuantity,
    {
      validate: quantity => quantity > 0 && quantity < 1000,
      errorHelperText: 'Quantity is invalid',
    },
  );

  const isSubmitDisabled = !product || !isValidQuantity;

  useEffect(() => {
    if (dialogProps.open) {
      clearProduct();
      setQuantity(initialQuantity);
    }
  }, [clearProduct, dialogProps.open, initialQuantity, setQuantity]);

  const handleSubmitClick = (): void => {
    if (product) {
      onDialogConfirm({
        mealType,
        productId: product.id,
        pageId,
        productQuantity: quantity,
        displayOrder,
      });
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <ProductSelect {...productSelectProps} label="Product" placeholder="Select a product" />
        <TextField
          {...bindQuantity()}
          type="number"
          label="Quantity"
          placeholder="Product quantity, g"
          margin="normal"
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitClick}
          disabled={isSubmitDisabled}
        >
          {submitText}
        </Button>
        <Button variant="text" onClick={onDialogCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteCreateEditDialog;