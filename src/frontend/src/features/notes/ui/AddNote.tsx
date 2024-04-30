import AddIcon from '@mui/icons-material/Add';
import { useState, type FC, useEffect, useMemo, useCallback } from 'react';
import { NoteInputForm } from '@/entities/notes/ui/NoteInputForm';
import { productsModel } from '@/entities/products';
import { ProductInputForm } from '@/entities/products/ui/ProductInputForm';
import { type CreateProductRequest, productsApi, useCategorySelect } from '@/features/products';
import { useToggle } from '@/shared/hooks';
import { Button, Dialog } from '@/shared/ui';
import { notesApi } from '../api';
import { toCreateNoteRequest } from '../mapping';
import { useNotes } from '../model';
import { type NoteCreateEdit, type MealType } from '../models';

type InputDialogStateType = 'note' | 'product';

export interface InputDialogState {
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

  const [productAutocompleteValue, setProductAutocompleteValue] =
    useState<productsModel.AutocompleteOptionType | null>(null);

  const [productDialogValue, setProductDialogValue] =
    useState<productsModel.ProductFormType>(EMPTY_DIALOG_VALUE);

  const [currentInputDialogType, setCurrentInputDialogType] =
    useState<InputDialogStateType>('note');

  const [noteSubmitDisabled, setNoteSubmitDisabled] = useState(true);
  const [productSubmitDisabled, setProductSubmitDisabled] = useState(true);

  const inputDialogStates = useMemo<InputDialogState[]>(
    () => [
      {
        type: 'note',
        title: 'New note',
        submitText: 'Add note',
        formId: 'note-form',
        submitLoading:
          createProductResponse.isLoading || createNoteResponse.isLoading || notes.isFetching,
        submitDisabled: false,
        cancelDisabled:
          createProductResponse.isLoading || createNoteResponse.isLoading || notes.isFetching,
        handleClose: () => {
          toggleDialog();
          setProductDialogValue(EMPTY_DIALOG_VALUE);
          setProductAutocompleteValue(null);
        },
      },
      {
        type: 'product',
        title: 'New product',
        submitText: 'Add product',
        submitLoading: false,
        submitDisabled: false,
        cancelDisabled: false,
        formId: 'product-form',
        handleClose: () => {
          setCurrentInputDialogType('note');
        },
      },
    ],
    [createNoteResponse.isLoading, createProductResponse.isLoading, notes.isFetching, toggleDialog],
  );

  const currentInputDialogState = useMemo(
    () => inputDialogStates.find(s => s.type === currentInputDialogType),
    [currentInputDialogType, inputDialogStates],
  );

  useEffect(() => {
    if (createNoteResponse.isSuccess && notes.isChanged) {
      toggleDialog();
      setProductDialogValue(EMPTY_DIALOG_VALUE);
      setProductAutocompleteValue(null);
    }
  }, [createNoteResponse.isSuccess, notes.isChanged, toggleDialog]);

  const handleDialogOpen = (): void => {
    setCurrentInputDialogType('note');
    toggleDialog();
  };

  const handleNoteInputFormProductChange = (
    value: productsModel.AutocompleteOptionType | null,
  ): void => {
    setProductAutocompleteValue(value);

    if (value === null || !value.freeSolo) {
      return;
    }

    setCurrentInputDialogType('product');
    setProductDialogValue(prev => ({ ...prev, name: value.name }));
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

  const handleNoteInputFormSubmit = async (noteValues: NoteCreateEdit): Promise<void> => {
    const productId = await createProductIfNotExists(noteValues.product);
    const request = toCreateNoteRequest(noteValues, productId);
    await createNote(request);
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
      <Button
        variant="text"
        size="medium"
        fullWidth
        startIcon={<AddIcon />}
        onClick={handleDialogOpen}
      >
        Add note
      </Button>
      {currentInputDialogState && (
        <Dialog
          title={currentInputDialogState.title}
          opened={dialogOpened}
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
                    product={productAutocompleteValue}
                    productAutocomplete={productAutocomplete}
                    dialogValue={productDialogValue}
                    shouldClearValues={dialogOpened}
                    onProductChange={handleNoteInputFormProductChange}
                    onSubmit={handleNoteInputFormSubmit}
                    onSubmitDisabledChange={handleNoteInputFormSubmitDisabledChange}
                  />
                );
              case 'product':
                return (
                  <ProductInputForm
                    id={currentInputDialogState.formId}
                    product={productDialogValue}
                    shouldClearValues={dialogOpened}
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
              onClick={currentInputDialogState.handleClose}
              disabled={currentInputDialogState.cancelDisabled}
            >
              Cancel
            </Button>
          )}
          renderSubmit={submitProps => (
            <Button
              {...submitProps}
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
