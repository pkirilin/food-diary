import React, { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { MealType, NoteCreateEdit, NoteItem } from '../models';
import { DialogCustomActionProps } from '../../__shared__/types';
import { useInput, useInputAutocomplete, useTypedSelector } from '../../__shared__/hooks';
import { ProductAutocomplete } from '../../products/components';

interface NoteCreateEditDialogProps extends DialogProps, DialogCustomActionProps<NoteCreateEdit> {
  mealType: MealType;
  pageId: number;
  note?: NoteItem;
}

const NoteCreateEditDialog: React.FC<NoteCreateEditDialogProps> = ({
  mealType,
  pageId,
  note,
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}: NoteCreateEditDialogProps) => {
  const { title, submitText, initialProduct, initialQuantity } = note
    ? {
        title: 'Edit note',
        submitText: 'Save',
        initialProduct: {
          id: note.productId,
          name: note.productName,
        },
        initialQuantity: note.productQuantity,
      }
    : { title: 'New note', submitText: 'Create', initialProduct: null, initialQuantity: 100 };

  const productInput = useInputAutocomplete(initialProduct);
  const quantityInput = useInput(initialQuantity);

  const maxDisplayOrderForNotesGroup = useTypedSelector(state =>
    state.notes.noteItems
      .filter(n => n.mealType === mealType)
      .reduce((max, note) => (note.displayOrder > max ? note.displayOrder : max), 0),
  );

  useEffect(() => {
    if (dialogProps.open) {
      productInput.setValue(initialProduct);
    }

    return () => {
      productInput.setValue(initialProduct);
      quantityInput.setValue(initialQuantity);
    };
  }, [dialogProps.open]);

  const handleSubmitClick = (): void => {
    if (productInput.value) {
      onDialogConfirm({
        mealType,
        productId: productInput.value.id,
        pageId,
        productQuantity: quantityInput.value,
        displayOrder: note ? note.displayOrder : maxDisplayOrderForNotesGroup,
      });
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <ProductAutocomplete {...productInput.binding}></ProductAutocomplete>
        <TextField
          {...quantityInput.binding}
          type="number"
          label="Quantity"
          placeholder="Product quantity, g"
          margin="normal"
          fullWidth
        ></TextField>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleSubmitClick}>
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
