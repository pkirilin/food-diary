import AddIcon from '@mui/icons-material/Add';
import { TextField } from '@mui/material';
import { useState, type FC, useEffect, type MouseEventHandler, type FormEventHandler } from 'react';
import { ProductAutocomplete, ProductInputDialog, productsModel } from '@/entities/products';
import { ProductAutocompleteWithoutDialog } from '@/entities/products/ui/ProductAutocomplete/ProductAutocompleteWithoutDialog';
import { CategorySelect } from '@/features/categories';
import { type CreateProductRequest, productsApi, useCategorySelect } from '@/features/products';
import { useInput } from '@/hooks';
import { useToggle } from '@/shared/hooks';
import { Button, Dialog } from '@/shared/ui';
import { mapToTextInputProps } from '@/utils/inputMapping';
import { validateProductName } from '@/utils/validation';
import { notesApi } from '../api';
import { toCreateNoteRequest } from '../mapping';
import { useNotes } from '../model';
import { type NoteCreateEdit, type MealType } from '../models';
import { NoteInputDialog } from './NoteInputDialog';

interface Props {
  pageId: number;
  mealType: MealType;
  displayOrder: number;
}

const toCreateProductRequest = ({
  name,
  caloriesCost,
  defaultQuantity,
  category,
}: productsModel.AutocompleteFreeSoloOption): CreateProductRequest => ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId: category?.id ?? 0,
});

const EMPTY_DIALOG_VALUE: productsModel.ProductFormType = {
  name: '',
  defaultQuantity: 100,
  caloriesCost: 100,
  category: {
    id: 1,
    name: 'Cereals',
  },
};

export const AddNote: FC<Props> = ({ pageId, mealType, displayOrder }) => {
  const [createNote, createNoteResponse] = notesApi.useCreateNoteMutation();
  const [createProduct, createProductResponse] = productsApi.useCreateProductMutation();
  const [dialogOpened, toggleDialog] = useToggle();
  const notes = useNotes(pageId);
  const productAutocomplete = productsModel.useAutocomplete();
  const categorySelect = useCategorySelect();

  const {
    clearValue: clearProduct,
    inputProps: productAutocompleteProps,
    value: productAutocompleteSelectedValue,
    setValue: setProductAutocompleteSelectedValue,
  } = useInput({
    initialValue: null,
    errorHelperText: 'Product is required',
    validate: productsModel.validateAutocompleteInput,
    mapToInputProps: productsModel.mapToAutocompleteProps,
  });

  const [editingProduct, toggleEditingProduct] = useToggle();

  const { setValue: setProductName, ...productName } = useInput({
    initialValue: EMPTY_DIALOG_VALUE.name,
    errorHelperText: 'Product name is invalid',
    validate: validateProductName,
    mapToInputProps: mapToTextInputProps,
  });

  useEffect(() => {
    if (productAutocompleteSelectedValue === null || !productAutocompleteSelectedValue.freeSolo) {
      return;
    }

    toggleEditingProduct();
    setProductName(productAutocompleteSelectedValue.name);
  }, [productAutocompleteSelectedValue, setProductName, toggleEditingProduct]);

  useEffect(() => {
    if (dialogOpened) {
      clearProduct();
    }
  }, [clearProduct, dialogOpened]);

  useEffect(() => {
    if (createNoteResponse.isSuccess && notes.isChanged) {
      toggleDialog();
    }
  }, [createNoteResponse.isSuccess, notes.isChanged, toggleDialog]);

  const handleDialogOpen = (): void => {
    toggleDialog();
  };

  const handleDialogClose = (): void => {
    if (editingProduct) {
      toggleEditingProduct();
    } else {
      toggleDialog();
    }
  };

  const createProductIfNotExists = async (
    product: productsModel.AutocompleteOptionType,
  ): Promise<number> => {
    if (!product.freeSolo) {
      return product.id;
    }

    const createProductRequest = toCreateProductRequest(product);
    const { id } = await createProduct(createProductRequest).unwrap();
    return id;
  };

  const handleAddNote = async (note: NoteCreateEdit): Promise<void> => {
    const productId = await createProductIfNotExists(note.product);
    const request = toCreateNoteRequest(note, productId);
    await createNote(request);
  };

  const handleCancel: MouseEventHandler<HTMLButtonElement> = () => {
    if (editingProduct) {
      toggleEditingProduct();
    } else {
      toggleDialog();
    }
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault();

    if (productAutocompleteSelectedValue === null) {
      return;
    }

    if (editingProduct) {
      setProductAutocompleteSelectedValue({
        freeSolo: true,
        editing: true,
        name: productName.value,
        caloriesCost: EMPTY_DIALOG_VALUE.caloriesCost,
        defaultQuantity: EMPTY_DIALOG_VALUE.defaultQuantity,
        category: EMPTY_DIALOG_VALUE.category,
      });
    } else {
      const note: NoteCreateEdit = {
        mealType,
        productQuantity: 123,
        displayOrder,
        product: productAutocompleteSelectedValue,
        pageId,
      };

      const productId = await createProductIfNotExists(note.product);
      const request = toCreateNoteRequest(note, productId);
      await createNote(request);
    }
  };

  return (
    <>
      <Button
        variant="text"
        size="medium"
        fullWidth
        startIcon={<AddIcon />}
        onClick={handleDialogOpen}
      >
        Add note
      </Button>
      <Dialog
        title={editingProduct ? 'Product' : 'Note'}
        opened={dialogOpened}
        onClose={handleDialogClose}
        content={
          <form id="note-form" onSubmit={handleSubmit}>
            {editingProduct ? (
              <TextField
                {...productName.inputProps}
                label="Name"
                placeholder="Product name"
                fullWidth
                autoFocus
              />
            ) : (
              <ProductAutocompleteWithoutDialog
                {...productAutocompleteProps}
                autoFocus
                value={productAutocompleteSelectedValue}
                dialogValue={{ ...EMPTY_DIALOG_VALUE, name: productName.value }}
                options={productAutocomplete.options}
                loading={productAutocomplete.isLoading}
              />
            )}
          </form>
        }
        renderCancel={cancelProps => (
          <Button {...cancelProps} onClick={handleCancel}>
            Cancel
          </Button>
        )}
        renderSubmit={submitProps => (
          <Button {...submitProps} form="note-form">
            Submit
          </Button>
        )}
      />
    </>
  );
};
