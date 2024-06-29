import KeyboardIcon from '@mui/icons-material/Keyboard';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import { type FC, useState, useCallback } from 'react';
import { type noteModel } from '@/entities/note';
import { ProductAutocomplete, type productLib, type productModel } from '@/entities/product';
import { type UseInputResult } from '@/shared/hooks';
import { Button, Dialog } from '@/shared/ui';
import { type Note, type InputMethod } from '../model';
import { NoteInputForm } from './NoteInputForm';
import { NoteInputFromPhotoFlow } from './NoteInputFromPhotoFlow';

interface Props {
  opened: boolean;
  title: string;
  submitText: string;
  submitLoading: boolean;
  noteFormValues: noteModel.FormValues;
  productAutocompleteData: productLib.AutocompleteData;
  productAutocompleteInput: UseInputResult<
    productModel.AutocompleteOption | null,
    productLib.AutocompleteInputProps
  >;
  productFormValues: productModel.FormValues;
  onClose: () => void;
  onSubmit: (note: Note) => Promise<void>;
  onProductChange: (product: productModel.AutocompleteOption | null) => void;
}

export const NoteInputDialog: FC<Props> = ({
  opened,
  title,
  submitText,
  submitLoading,
  noteFormValues,
  productAutocompleteData,
  productAutocompleteInput,
  productFormValues,
  onClose,
  onSubmit,
  onProductChange,
}) => {
  const [selectedInputMethod, setSelectedInputMethod] = useState<InputMethod>('fromInput');
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const handleSelectedInputMethodChange = (_: React.SyntheticEvent, value: InputMethod): void => {
    setSelectedInputMethod(value);
  };

  const handleSubmitDisabledChange = useCallback((disabled: boolean): void => {
    setSubmitDisabled(disabled);
  }, []);

  const handleFileUploaded = async (_: File): Promise<void> => {};

  return (
    <Dialog
      disableContentPadding
      pinToTop
      renderMode="fullScreenOnMobile"
      opened={opened}
      title={title}
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
              renderProductAutocomplete={() => (
                <ProductAutocomplete
                  {...productAutocompleteInput.inputProps}
                  autoFocus
                  formValues={productFormValues}
                  onChange={onProductChange}
                  options={productAutocompleteData.options}
                  loading={productAutocompleteData.isLoading}
                />
              )}
              onSubmit={onSubmit}
              onSubmitDisabledChange={handleSubmitDisabledChange}
            />
          </Box>
          <TabPanel value={'fromPhoto' satisfies InputMethod}>
            <NoteInputFromPhotoFlow onUploadSuccess={handleFileUploaded} />
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
          {submitText}
        </Button>
      )}
    />
  );
};
