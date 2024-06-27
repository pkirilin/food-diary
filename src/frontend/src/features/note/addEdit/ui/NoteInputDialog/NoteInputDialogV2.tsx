import KeyboardIcon from '@mui/icons-material/Keyboard';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { TabContext, TabList } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import { type FC, useState, useCallback } from 'react';
import { type noteModel } from '@/entities/note';
import { ProductAutocomplete, type productLib, type productModel } from '@/entities/product';
import { type UseInputResult } from '@/shared/hooks';
import { Button, Dialog } from '@/shared/ui';
import { type Note, type InputMethod } from '../../model';
import { NoteInputForm } from '../NoteInputForm';
import { TabPanelStyled } from './NoteInputDialog.styles';

interface Props {
  opened: boolean;
  title: string;
  submitText: string;
  submitLoading: boolean;
  mealType: noteModel.MealType;
  pageId: number;
  quantity: number;
  displayOrder: number;
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

export const NoteInputDialogV2: FC<Props> = ({
  opened,
  title,
  submitText,
  submitLoading,
  mealType,
  pageId,
  displayOrder,
  quantity,
  productAutocompleteData,
  productAutocompleteInput,
  productFormValues,
  onClose,
  onSubmit,
  onProductChange,
}) => {
  const [selectedInputMethod, setSelectedInputMethod] = useState<InputMethod>('default');
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const handleSelectedInputMethodChange = (_: React.SyntheticEvent, value: InputMethod): void => {
    setSelectedInputMethod(value);
  };

  const handleSubmitDisabledChange = useCallback((disabled: boolean): void => {
    setSubmitDisabled(disabled);
  }, []);

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
                value={'default' satisfies InputMethod}
              />
              <Tab
                icon={<PhotoCameraIcon />}
                iconPosition="start"
                label="From photo"
                value={'photo' satisfies InputMethod}
              />
            </TabList>
          </Box>
          <TabPanelStyled value={'default' satisfies InputMethod}>
            <NoteInputForm
              id="note-input-form"
              pageId={pageId}
              mealType={mealType}
              displayOrder={displayOrder}
              productAutocompleteInput={productAutocompleteInput}
              quantity={quantity}
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
              onSubmitDisabledChange={handleSubmitDisabledChange}
            />
          </TabPanelStyled>
          <TabPanelStyled value={'photo' satisfies InputMethod}>WIP</TabPanelStyled>
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
