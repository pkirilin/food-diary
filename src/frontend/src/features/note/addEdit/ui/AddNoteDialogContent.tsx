import KeyboardIcon from '@mui/icons-material/Keyboard';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import { type FC } from 'react';
import { type noteModel } from '@/entities/note';
import { ProductAutocomplete } from '@/entities/product';
import { type RenderContentProps, type RecognizeNotesResult } from '../lib';
import { type UploadedPhoto, type InputMethod } from '../model';
import { NoteInputForm } from './NoteInputForm';
import { NoteInputFromPhotoFlow } from './NoteInputFromPhotoFlow';

interface Props extends RenderContentProps {
  noteFormValues: noteModel.FormValues;
  recognizeNotesResult: RecognizeNotesResult;
  uploadedPhotos: UploadedPhoto[];
  selectedInputMethod: InputMethod;
  onUploadSuccess: (photos: UploadedPhoto[]) => Promise<void>;
  onSelectedInputMethodChange: (value: InputMethod) => void;
}

export const AddNoteDialogContent: FC<Props> = ({
  submitLoading,
  submitDisabled,
  noteFormValues,
  productFormValues,
  productAutocompleteInput,
  productAutocompleteData,
  recognizeNotesResult,
  uploadedPhotos,
  selectedInputMethod,
  onClose,
  onSubmit,
  onSubmitDisabledChange,
  onProductChange,
  onUploadSuccess,
  onProductFormValuesChange,
  onSelectedInputMethodChange,
}) => {
  const handleSelectedInputMethodChange = (_: React.SyntheticEvent, value: InputMethod): void => {
    onSelectedInputMethodChange(value);
  };

  return (
    <TabContext value={selectedInputMethod}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList
          variant="scrollable"
          scrollButtons="auto"
          onChange={handleSelectedInputMethodChange}
        >
          <Tab
            icon={<KeyboardIcon />}
            iconPosition="start"
            label="From input"
            value={'fromInput' satisfies InputMethod}
          />
          <Tab
            icon={<PhotoCameraIcon />}
            iconPosition="start"
            label="From photo"
            value={'fromPhoto' satisfies InputMethod}
          />
        </TabList>
      </Box>
      <Box px={0} pb={0} component={TabPanel} value={'fromInput' satisfies InputMethod}>
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
      </Box>
      <Box
        px={0}
        pb={recognizeNotesResult.isSuccess && recognizeNotesResult.notes.length > 0 ? 0 : undefined}
        component={TabPanel}
        value={'fromPhoto' satisfies InputMethod}
      >
        <NoteInputFromPhotoFlow
          submitLoading={submitLoading}
          submitDisabled={submitDisabled}
          noteFormValues={noteFormValues}
          productFormValues={productFormValues}
          productAutocompleteData={productAutocompleteData}
          productAutocompleteInput={productAutocompleteInput}
          recognizeNotesResult={recognizeNotesResult}
          uploadedPhotos={uploadedPhotos}
          onClose={onClose}
          onSubmit={onSubmit}
          onSubmitDisabledChange={onSubmitDisabledChange}
          onProductChange={onProductChange}
          onUploadSuccess={onUploadSuccess}
          onProductFormValuesChange={onProductFormValuesChange}
        />
      </Box>
    </TabContext>
  );
};
