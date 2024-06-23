import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Stack,
} from '@mui/material';
import { useEffect, type FC, useState } from 'react';
import { type categoryLib } from '@/entities/category';
import { type noteModel } from '@/entities/note';
import { productLib } from '@/entities/product';
import { Button, Dialog } from '@/shared/ui';
import { type RecognizeNotesResult, useNoteDialog, useProductDialog } from '../lib';
import { type UploadedPhoto, type Note, type DialogState, type DialogStateType } from '../model';

interface Props {
  opened: boolean;
  pageId: number;
  mealType: noteModel.MealType;
  displayOrder: number;
  uploadedPhotos: UploadedPhoto[];
  productAutocompleteData: productLib.AutocompleteData;
  categorySelect: categoryLib.CategorySelectData;
  recognizeNotesResult: RecognizeNotesResult;
  submitSuccess: boolean;
  onSubmit: (note: Note) => Promise<void>;
  onSubmitSuccess: () => void;
  onClose: () => void;
  onRecognizeNotesRetry: () => Promise<void>;
}

export const NoteInputDialogByPhoto: FC<Props> = ({
  opened,
  pageId,
  mealType,
  displayOrder,
  uploadedPhotos,
  productAutocompleteData,
  categorySelect,
  recognizeNotesResult,
  submitSuccess,
  onSubmit,
  onSubmitSuccess,
  onClose,
  onRecognizeNotesRetry,
}) => {
  const productAutocompleteInput = productLib.useAutocompleteInput();

  const { setValue: setProductAutocompleteValue, clearValue: clearProductAutocompleteValue } =
    productAutocompleteInput;

  const {
    values: productFormValues,
    setValues: setProductFormValues,
    clearValues: clearProductFormValues,
  } = productLib.useFormValues();

  const [currentInputDialogType, setCurrentInputDialogType] = useState<DialogStateType>('note');

  const {
    state: noteDialogState,
    onSubmitSuccess: onNoteSubmitSuccess,
    onSubmitDisabledChange: onNoteSubmitDisabledChange,
  } = useNoteDialog({
    pageId,
    mealType,
    displayOrder,
    title: 'New note',
    submitText: 'Add',
    quantity: 100,
    productAutocompleteData,
    productAutocompleteInput,
    productFormValues,
    onSubmit,
    onClose: () => {
      onClose();
      clearProductFormValues();
      clearProductAutocompleteValue();
    },
    onProductChange: value => {
      setProductAutocompleteValue(value);
      clearProductFormValues();

      if (value?.freeSolo === true) {
        setCurrentInputDialogType('product');

        setProductFormValues({
          name: value.name,
          caloriesCost: value.caloriesCost,
          defaultQuantity: value.defaultQuantity,
          category: value.category,
        });
      }
    },
  });

  const { state: productDialogState } = useProductDialog({
    productFormValues,
    categorySelect,
    onClose: () => {
      setCurrentInputDialogType('note');
    },
    onSubmit: formValues => {
      const { name, caloriesCost, defaultQuantity, category } = formValues;

      setProductAutocompleteValue({
        freeSolo: true,
        editing: true,
        name,
        caloriesCost,
        defaultQuantity,
        category,
      });

      setProductFormValues(formValues);
      setCurrentInputDialogType('note');
    },
  });

  const dialogStates: DialogState[] = [noteDialogState, productDialogState];
  const currentDialogState = dialogStates.find(s => s.type === currentInputDialogType);

  useEffect(() => {
    if (opened) {
      clearProductFormValues();
      clearProductAutocompleteValue();
    }
  }, [clearProductAutocompleteValue, clearProductFormValues, opened]);

  useEffect(() => {
    if (submitSuccess) {
      onSubmitSuccess();
      onNoteSubmitSuccess();
    }
  }, [onNoteSubmitSuccess, onSubmitSuccess, submitSuccess]);

  useEffect(() => {
    if (!recognizeNotesResult.isSuccess) {
      onNoteSubmitDisabledChange(true);
      return;
    }

    const note = recognizeNotesResult.notes.at(0);
    const category = categorySelect.data.at(0);

    if (!note || !category) {
      onNoteSubmitDisabledChange(true);
      return;
    }

    onNoteSubmitDisabledChange(false);

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
  }, [
    categorySelect.data,
    onNoteSubmitDisabledChange,
    recognizeNotesResult.isSuccess,
    recognizeNotesResult.notes,
    setProductAutocompleteValue,
    setProductFormValues,
  ]);

  if (!currentDialogState) {
    return null;
  }

  return (
    <Dialog
      opened={opened}
      renderMode="fullScreenOnMobile"
      title={currentDialogState.title}
      onClose={currentDialogState.onClose}
      content={
        <Stack spacing={3}>
          <ImageList cols={2} gap={16}>
            {uploadedPhotos.map((photo, index) => (
              <ImageListItem key={index}>
                <Box
                  component="img"
                  height="194px"
                  src={photo.src}
                  alt={photo.name}
                  sx={{ objectFit: 'cover' }}
                />
                <ImageListItemBar title={photo.name} />
              </ImageListItem>
            ))}
          </ImageList>
          {recognizeNotesResult.isLoading && (
            <Stack justifyContent="center" alignItems="center" mb={2}>
              <CircularProgress />
            </Stack>
          )}
          {recognizeNotesResult.error && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={onRecognizeNotesRetry}>
                  Retry
                </Button>
              }
            >
              <AlertTitle>{recognizeNotesResult.error.title}</AlertTitle>
              {recognizeNotesResult.error.message}
            </Alert>
          )}
          {recognizeNotesResult.isSuccess && (
            <>
              {recognizeNotesResult.notes.length > 0 && currentDialogState.content}
              {recognizeNotesResult.notes.length === 0 && (
                <Alert severity="warning">No food found on your photo</Alert>
              )}
            </>
          )}
        </Stack>
      }
      renderCancel={cancelProps => (
        <Button
          {...cancelProps}
          type="button"
          disabled={currentDialogState.cancelDisabled}
          onClick={currentDialogState.onClose}
        >
          Cancel
        </Button>
      )}
      renderSubmit={submitProps => (
        <Button
          {...submitProps}
          type="submit"
          form={currentDialogState.formId}
          disabled={currentDialogState.submitDisabled}
          loading={currentDialogState.submitLoading}
        >
          {currentDialogState.submitText}
        </Button>
      )}
    />
  );
};
