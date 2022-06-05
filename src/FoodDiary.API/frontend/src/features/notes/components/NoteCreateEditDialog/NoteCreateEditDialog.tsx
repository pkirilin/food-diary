import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  TextField,
} from '@material-ui/core';

import { DialogCustomActionProps } from 'src/features/__shared__/types';
import { useAppSelector, useValidatedNumericInput } from 'src/features/__shared__/hooks';
import { MealType, NoteCreateEdit, NoteItem } from 'src/features/notes/models';
import ProductSelect from 'src/features/products/components/ProductSelect';
import { ProductAutocompleteOption } from 'src/features/products/models';

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
  const title = note ? 'Edit note' : 'New note';
  const submitText = note ? 'Save' : 'Create';
  const initialQuantity = note ? note.productQuantity : 100;

  const initialProduct = useMemo<ProductAutocompleteOption | null>(
    () =>
      note
        ? {
            id: note.productId,
            name: note.productName,
          }
        : null,
    [note],
  );

  const [product, setProduct] = useState(initialProduct);

  const [quantity, setQuantity, bindQuantity, isValidQuantity] = useValidatedNumericInput(
    initialQuantity,
    {
      validate: quantity => quantity > 0 && quantity < 1000,
      errorHelperText: 'Quantity is invalid',
    },
  );

  const isSubmitDisabled = !product || !isValidQuantity;

  const maxDisplayOrderForNotesGroup = useAppSelector(state =>
    state.notes.noteItems
      .filter(note => note.mealType === mealType)
      .reduce(
        (maxOrder, note) => (note.displayOrder > maxOrder ? note.displayOrder : maxOrder),
        -1,
      ),
  );

  useEffect(() => {
    if (dialogProps.open) {
      setProduct(initialProduct);
      setQuantity(initialQuantity);
    }
  }, [dialogProps.open, initialProduct, initialQuantity, setQuantity]);

  const handleSubmitClick = (): void => {
    if (product) {
      onDialogConfirm({
        mealType,
        productId: product.id,
        pageId,
        productQuantity: quantity,
        displayOrder: note ? note.displayOrder : maxDisplayOrderForNotesGroup + 1,
      });
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <ProductSelect
          label="Product"
          placeholder="Select a product"
          value={product}
          setValue={value => setProduct(value)}
        ></ProductSelect>
        <TextField
          {...bindQuantity()}
          type="number"
          label="Quantity"
          placeholder="Product quantity, g"
          margin="normal"
          fullWidth
        ></TextField>
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
