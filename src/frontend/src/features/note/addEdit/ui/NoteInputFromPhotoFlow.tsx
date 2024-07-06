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
import { type FC } from 'react';
import { type noteModel } from '@/entities/note';
import { ProductAutocomplete, type productModel } from '@/entities/product';
import { convertToBase64String, resizeImage } from '@/shared/lib';
import { Button, UploadButton } from '@/shared/ui';
import { type RecognizeNotesResult, type RenderContentProps } from '../lib';
import { type UploadedPhoto } from '../model';
import { NoteInputForm } from './NoteInputForm';

interface Props extends RenderContentProps {
  noteFormValues: noteModel.FormValues;
  recognizeNotesResult: RecognizeNotesResult;
  uploadedPhotos: UploadedPhoto[];
  onUploadSuccess: (photos: UploadedPhoto[]) => Promise<void>;
  onProductFormValuesChange: (values: productModel.FormValues) => void;
}

export const NoteInputFromPhotoFlow: FC<Props> = ({
  noteFormValues,
  productFormValues,
  productAutocompleteInput,
  productAutocompleteData,
  recognizeNotesResult,
  uploadedPhotos,
  onSubmit,
  onSubmitDisabledChange,
  onProductChange,
  onUploadSuccess,
}) => {
  const handleUpload = async (file: File): Promise<void> => {
    const base64 = await convertToBase64String(file);
    const resizedFile = await resizeImage(base64, 512, file.name);
    const resizedBase64 = await convertToBase64String(resizedFile);

    await onUploadSuccess([
      {
        src: resizedBase64,
        name: file.name,
        file: resizedFile,
      },
    ]);
  };

  const handleRetry = async (): Promise<void> => {
    await onUploadSuccess(uploadedPhotos);
  };

  if (uploadedPhotos.length === 0) {
    return (
      <UploadButton name="photos" accept="image/*" onUpload={handleUpload}>
        Upload photo
      </UploadButton>
    );
  }

  return (
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
            <Button color="inherit" size="small" onClick={handleRetry}>
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
          {recognizeNotesResult.notes.length === 0 && (
            <Alert severity="warning">No food found on your photo</Alert>
          )}
          {recognizeNotesResult.notes.length > 0 && (
            <NoteInputForm
              id="note-input-form"
              values={noteFormValues}
              productAutocompleteInput={productAutocompleteInput}
              renderProductAutocomplete={productAutocompleteProps => (
                <ProductAutocomplete
                  {...productAutocompleteProps}
                  autoFocus
                  formValues={productFormValues}
                  onChange={onProductChange}
                  options={productAutocompleteData.options}
                  loading={productAutocompleteData.isLoading}
                />
              )}
              onSubmit={onSubmit}
              onSubmitDisabledChange={onSubmitDisabledChange}
            />
          )}
        </>
      )}
    </Stack>
  );
};
