import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
import {
  useAsyncAutocompleteInput,
  useTypedSelector,
  useValidatedNumericInput,
} from '../../__shared__/hooks';
import { SimpleAutocomplete } from '../../__shared__/components';
import { getProductsAutocomplete } from '../../products/thunks';
import { autocompleteCleared } from '../../products/slice';

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

  const dispatch = useDispatch();

  const [product, setProduct, bindProduct] = useAsyncAutocompleteInput(
    state => state.products.autocompleteOptions,
    active => {
      dispatch(getProductsAutocomplete(active));
    },
    () => {
      dispatch(autocompleteCleared());
    },
  );

  const [quantity, setQuantity, bindQuantity, isValidQuantity] = useValidatedNumericInput(
    initialQuantity,
    {
      validate: quantity => quantity > 0 && quantity < 1000,
      errorHelperText: 'Quantity is invalid',
    },
  );

  const isSubmitDisabled = !product || !isValidQuantity;

  const maxDisplayOrderForNotesGroup = useTypedSelector(state =>
    state.notes.noteItems
      .filter(n => n.mealType === mealType)
      .reduce((max, note) => (note.displayOrder > max ? note.displayOrder : max), 0),
  );

  useEffect(() => {
    if (dialogProps.open) {
      setProduct(initialProduct);
      setQuantity(initialQuantity);
    }
  }, [dialogProps.open]);

  const handleSubmitClick = (): void => {
    if (product) {
      onDialogConfirm({
        mealType,
        productId: product.id,
        pageId,
        productQuantity: quantity,
        displayOrder: note ? note.displayOrder : maxDisplayOrderForNotesGroup,
      });
    }
  };

  return (
    <Dialog maxWidth="xs" fullWidth {...dialogProps}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <SimpleAutocomplete
          {...bindProduct()}
          inputLabel="Product"
          inputPlaceholder="Select a product"
        ></SimpleAutocomplete>
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
