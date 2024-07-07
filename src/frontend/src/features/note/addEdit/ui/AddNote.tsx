import AddIcon from '@mui/icons-material/Add';
import { useCallback, type FC, useState } from 'react';
import { categoryLib } from '@/entities/category';
import { noteApi, type noteModel, noteLib } from '@/entities/note';
import { productLib } from '@/entities/product';
import { Button } from '@/shared/ui';
import { useAddProductIfNotExists, useRecognizeNotes } from '../lib';
import { mapToCreateNoteRequest } from '../lib/mapping';
import { type UploadedPhoto, type Note, type InputMethod } from '../model';
import { AddNoteDialogContent } from './AddNoteDialogContent';
import { NoteInputFlow } from './NoteInputFlow';

interface Props {
  pageId: number;
  mealType: noteModel.MealType;
}

export const AddNote: FC<Props> = ({ pageId, mealType }) => {
  const [addNote, { reset, ...addNoteResponse }] = noteApi.useCreateNoteMutation();

  const addProductIfNotExists = useAddProductIfNotExists();
  const [recognizeNotes, recognizeNotesResult] = useRecognizeNotes();

  const notes = noteLib.useNotes(pageId);
  const displayOrder = noteLib.useNextDisplayOrder(pageId);

  const { clearValues: clearNoteForm, ...noteForm } = noteLib.useFormValues({
    pageId,
    mealType,
    displayOrder,
    quantity: 100,
  });

  const productAutocompleteData = productLib.useAutocompleteData();
  const categorySelect = categoryLib.useCategorySelectData();

  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [selectedInputMethod, setSelectedInputMethod] = useState<InputMethod>('fromInput');

  const handleSubmit = async (formData: Note): Promise<void> => {
    const productId = await addProductIfNotExists.sendRequest(formData.product);
    const request = mapToCreateNoteRequest(formData, productId);
    await addNote(request).unwrap();
  };

  const handleSubmitSuccess = useCallback(() => {
    reset();
    setSelectedInputMethod('fromInput');
    clearNoteForm();
  }, [clearNoteForm, reset]);

  const handleCancel = useCallback(() => {
    setUploadedPhotos([]);
    setSelectedInputMethod('fromInput');
    clearNoteForm();
  }, [clearNoteForm]);

  const handleUploadSuccess = async (photos: UploadedPhoto[]): Promise<void> => {
    setUploadedPhotos(photos);
    await recognizeNotes(photos[0].file);
  };

  return (
    <NoteInputFlow
      renderTrigger={handleAddNoteClick => (
        <Button
          variant="text"
          size="medium"
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleAddNoteClick}
        >
          Add note
        </Button>
      )}
      renderContent={dialogProps => (
        <AddNoteDialogContent
          {...dialogProps}
          noteFormValues={noteForm.values}
          recognizeNotesResult={recognizeNotesResult}
          selectedInputMethod={selectedInputMethod}
          uploadedPhotos={uploadedPhotos}
          onUploadSuccess={handleUploadSuccess}
          onSelectedInputMethodChange={setSelectedInputMethod}
        />
      )}
      submitText="Add"
      submitSuccess={addNoteResponse.isSuccess && notes.isChanged}
      product={null}
      productAutocompleteData={productAutocompleteData}
      categorySelect={categorySelect}
      recognizeNotesResult={recognizeNotesResult}
      disableContentPaddingTop
      onCancel={handleCancel}
      onSubmit={handleSubmit}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
};
