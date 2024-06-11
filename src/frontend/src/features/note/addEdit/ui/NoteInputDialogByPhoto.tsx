import {
  Alert,
  Box,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Stack,
} from '@mui/material';
import { useEffect, type FC } from 'react';
import { type categoryLib } from '@/entities/category';
import { type RecognizeNoteItem, type noteModel } from '@/entities/note';
import { ProductAutocomplete, productLib } from '@/entities/product';
import { NoteInputForm } from '@/features/note/addEdit';
import { Button, Dialog } from '@/shared/ui';
import { type UploadedPhoto, type Note } from '../model';

interface Props {
  opened: boolean;
  pageId: number;
  mealType: noteModel.MealType;
  displayOrder: number;
  uploadedPhotos: UploadedPhoto[];
  productAutocompleteData: productLib.AutocompleteData;
  categorySelect: categoryLib.CategorySelectData;
  recognizedNotes: RecognizeNoteItem[];
  recognizeNotesLoading: boolean;
  recognizeNotesError: boolean;
  recognizeNotesSuccess: boolean;
  submitLoading: boolean;
  submitSuccess: boolean;
  onSubmit: (note: Note) => Promise<void>;
  onSubmitSuccess: () => void;
  onCancel: () => void;
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
  recognizedNotes,
  recognizeNotesLoading,
  recognizeNotesError,
  recognizeNotesSuccess,
  submitLoading,
  submitSuccess,
  onSubmit,
  onSubmitSuccess,
  onCancel,
  onRecognizeNotesRetry,
}) => {
  const productAutocompleteInput = productLib.useAutocompleteInput();
  const { setValue: setProduct } = productAutocompleteInput;
  const { values: productFormValues } = productLib.useFormValues();
  const submitDisabled = recognizeNotesLoading || recognizeNotesError || submitLoading;

  useEffect(() => {
    if (submitSuccess) {
      onSubmitSuccess();
    }
  }, [onSubmitSuccess, submitSuccess]);

  useEffect(() => {
    if (!recognizeNotesSuccess) {
      return;
    }

    const note = recognizedNotes.at(0);
    const category = categorySelect.data.at(0);

    if (!note || !category) {
      return;
    }

    setProduct({
      freeSolo: true,
      editing: true,
      name: note.product.name,
      caloriesCost: note.product.caloriesCost,
      defaultQuantity: note.quantity,
      category,
    });
  }, [categorySelect.data, recognizeNotesSuccess, recognizedNotes, setProduct]);

  return (
    <Dialog
      opened={opened}
      renderMode="fullScreenOnMobile"
      title="New note"
      onClose={onCancel}
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
          {recognizeNotesLoading && (
            <Stack justifyContent="center" alignItems="center" mb={2}>
              <CircularProgress />
            </Stack>
          )}
          {recognizeNotesError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={onRecognizeNotesRetry}>
                  Retry
                </Button>
              }
            >
              Failed to recognize note. Please try again.
            </Alert>
          )}
          {recognizeNotesSuccess && (
            <NoteInputForm
              id="note-input-form"
              pageId={pageId}
              mealType={mealType}
              displayOrder={displayOrder}
              quantity={100}
              productAutocompleteInput={productAutocompleteInput}
              renderProductAutocomplete={productAutocompleteProps => (
                <ProductAutocomplete
                  {...productAutocompleteProps}
                  formValues={productFormValues}
                  options={productAutocompleteData.options}
                  loading={productAutocompleteData.isLoading}
                />
              )}
              onSubmit={onSubmit}
              onSubmitDisabledChange={() => {}}
            />
          )}
        </Stack>
      }
      renderSubmit={submitProps => (
        <Button
          {...submitProps}
          type="submit"
          form="note-input-form"
          disabled={submitDisabled}
          loading={submitLoading}
        >
          Add
        </Button>
      )}
      renderCancel={cancelProps => (
        <Button {...cancelProps} type="button" onClick={onCancel} disabled={submitDisabled}>
          Cancel
        </Button>
      )}
    />
  );
};
