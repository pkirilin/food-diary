import KeyboardIcon from '@mui/icons-material/Keyboard';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import { type FC, useState } from 'react';
import { type noteModel } from '@/entities/note';
import { ProductAutocomplete } from '@/entities/product';
import { Button, Dialog } from '@/shared/ui';
import { type RenderDialogProps } from '../lib';
import { type InputMethod } from '../model';
import { NoteInputForm } from './NoteInputForm';
import { NoteInputFromPhotoFlow } from './NoteInputFromPhotoFlow';

interface Props extends RenderDialogProps {
  noteFormValues: noteModel.FormValues;
}

export const AddNoteDialog: FC<Props> = ({
  opened,
  submitLoading,
  submitDisabled,
  noteFormValues,
  productFormValues,
  productAutocompleteInput,
  productAutocompleteData,
  onClose,
  onSubmit,
  onSubmitDisabledChange,
  onProductChange,
}) => {
  const [selectedInputMethod, setSelectedInputMethod] = useState<InputMethod>('fromInput');

  const handleSelectedInputMethodChange = (_: React.SyntheticEvent, value: InputMethod): void => {
    setSelectedInputMethod(value);
  };

  const handleFileUpload = async (_: File): Promise<void> => {};

  return (
    <Dialog
      disableContentPadding
      pinToTop
      renderMode="fullScreenOnMobile"
      opened={opened}
      title="New note"
      content={
        <TabContext value={selectedInputMethod}>
          <Box px={3} sx={{ borderBottom: 1, borderColor: 'divider' }}>
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
          <Box pb={0} component={TabPanel} value={'fromInput' satisfies InputMethod}>
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
          <TabPanel value={'fromPhoto' satisfies InputMethod}>
            <NoteInputFromPhotoFlow onUploadSuccess={handleFileUpload} />
          </TabPanel>
        </TabContext>
      }
      onClose={onClose}
      renderCancel={cancelProps => (
        <Button {...cancelProps} type="button" disabled={submitLoading} onClick={onClose}>
          Cancel
        </Button>
      )}
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
    />
  );
};
