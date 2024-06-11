import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { Box, styled } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { type FC, useState, type ChangeEventHandler, useCallback } from 'react';
import { categoryLib } from '@/entities/category';
import { noteApi, noteLib, type noteModel } from '@/entities/note';
import { productLib } from '@/entities/product';
import { useToggle } from '@/shared/hooks';
import { convertToBase64String, resizeImage } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { mapToCreateNoteRequest, useAddProductIfNotExists } from '../lib';
import { type UploadedPhoto, type Note } from '../model';
import { NoteInputDialogByPhoto } from './NoteInputDialogByPhoto';

interface Props {
  pageId: number;
  mealType: noteModel.MealType;
  displayOrder: number;
}

const FileInputStyled = styled('input')(() => ({ ...visuallyHidden }));

export const AddNoteByPhoto: FC<Props> = ({ pageId, mealType, displayOrder }) => {
  const [dialogOpened, toggleDialog] = useToggle();
  const [recognizeNote, recognizeNoteResponse] = noteApi.useRecognizeMutation();
  const [addNote, addNoteResponse] = noteApi.useCreateNoteMutation();
  const addProductIfNotExists = useAddProductIfNotExists();
  const notes = noteLib.useNotes(pageId);
  const productAutocompleteData = productLib.useAutocompleteData();
  const categorySelect = categoryLib.useCategorySelectData();
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handlePhotoUploaded: ChangeEventHandler<HTMLInputElement> = async event => {
    try {
      const file = event.target?.files?.item(0);

      if (!file || !file.type.startsWith('image')) {
        return;
      }

      const base64 = await convertToBase64String(file);
      const resizedFile = await resizeImage(base64, 512, file.name);
      const resizedBase64 = await convertToBase64String(resizedFile);

      setUploadedPhotos([
        {
          src: resizedBase64,
          name: file.name,
          file,
        },
      ]);

      toggleDialog();

      const formData = new FormData();
      formData.append('files', resizedFile);
      await recognizeNote(formData);
    } finally {
      event.target.value = '';
    }
  };

  const handleRecognizeNotesRetry = async (): Promise<void> => {
    const formData = new FormData();
    formData.append('files', uploadedPhotos[0].file);
    await recognizeNote(formData);
  };

  const handleSubmit = async (note: Note): Promise<void> => {
    try {
      setSubmitLoading(true);
      const productId = await addProductIfNotExists(note.product);
      const request = mapToCreateNoteRequest(note, productId);
      await addNote(request);
    } catch (err) {
      setSubmitLoading(false);
    }
  };

  const handleSubmitSuccess = useCallback(() => {
    setSubmitLoading(false);
    toggleDialog();
  }, [toggleDialog]);

  return (
    <Box component="form" width="100%">
      <Button
        role={undefined}
        component="label"
        variant="text"
        fullWidth
        startIcon={<AddAPhotoIcon />}
      >
        Add photo
        <FileInputStyled
          type="file"
          name="photos"
          accept="image/*"
          onChange={handlePhotoUploaded}
        />
      </Button>
      <NoteInputDialogByPhoto
        opened={dialogOpened}
        pageId={pageId}
        mealType={mealType}
        displayOrder={displayOrder}
        uploadedPhotos={uploadedPhotos}
        recognizedNotes={recognizeNoteResponse.data?.notes ?? []}
        recognizeNotesLoading={recognizeNoteResponse.isLoading}
        recognizeNotesError={recognizeNoteResponse.isError}
        recognizeNotesSuccess={recognizeNoteResponse.isSuccess}
        submitLoading={submitLoading}
        submitSuccess={addNoteResponse.isSuccess && notes.isChanged}
        productAutocompleteData={productAutocompleteData}
        categorySelect={categorySelect}
        onCancel={toggleDialog}
        onSubmit={handleSubmit}
        onSubmitSuccess={handleSubmitSuccess}
        onRecognizeNotesRetry={handleRecognizeNotesRetry}
      />
    </Box>
  );
};
