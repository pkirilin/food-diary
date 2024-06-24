import KeyboardIcon from '@mui/icons-material/Keyboard';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { TabContext, TabList } from '@mui/lab';
import { Box, Tab } from '@mui/material';
import { type FC, useEffect, useState } from 'react';
import { type categoryLib } from '@/entities/category';
import { type noteModel } from '@/entities/note';
import { productLib, type productModel } from '@/entities/product';
import { Button, Dialog } from '@/shared/ui';
import { useNoteDialog, useProductDialog } from '../../lib';
import { type Note, type DialogState, type DialogStateType, type InputMethod } from '../../model';
import { TabPanelStyled } from './NoteInputDialog.styles';

interface Props {
  opened: boolean;
  title: string;
  submitText: string;
  mealType: noteModel.MealType;
  pageId: number;
  product: productModel.AutocompleteOption | null;
  quantity: number;
  displayOrder: number;
  productAutocompleteData: productLib.AutocompleteData;
  categorySelect: categoryLib.CategorySelectData;
  submitSuccess: boolean;
  onClose: () => void;
  onSubmit: (note: Note) => Promise<void>;
  onSubmitSuccess: () => void;
}

export const NoteInputDialog: FC<Props> = ({
  opened,
  title,
  submitText,
  mealType,
  pageId,
  product,
  displayOrder,
  categorySelect,
  submitSuccess,
  quantity,
  productAutocompleteData,
  onClose,
  onSubmit,
  onSubmitSuccess,
}) => {
  const productAutocompleteInput = productLib.useAutocompleteInput(product);

  const { setValue: setProductAutocompleteValue, clearValue: clearProductAutocompleteValue } =
    productAutocompleteInput;

  const {
    values: productFormValues,
    setValues: setProductFormValues,
    clearValues: clearProductFormValues,
  } = productLib.useFormValues();

  const [selectedInputMethod, setSelectedInputMethod] = useState<InputMethod>('default');
  const [currentInputDialogType, setCurrentInputDialogType] = useState<DialogStateType>('note');

  const handleSelectedInputMethodChange = (
    _: React.SyntheticEvent,
    newValue: InputMethod,
  ): void => {
    setSelectedInputMethod(newValue);
  };

  const { state: noteDialogState, onSubmitSuccess: onNoteSubmitSuccess } = useNoteDialog({
    pageId,
    mealType,
    displayOrder,
    title,
    submitText,
    quantity,
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

  const dialogStates: DialogState[] = [noteDialogState, productDialogState];

  const currentDialogState = dialogStates.find(s => s.type === currentInputDialogType);

  if (!currentDialogState) {
    return null;
  }

  return (
    <Dialog
      disableContentPadding
      pinToTop
      renderMode="fullScreenOnMobile"
      opened={opened}
      title={currentDialogState.title}
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
            {currentDialogState.content}
          </TabPanelStyled>
          <TabPanelStyled value={'photo' satisfies InputMethod}>WIP</TabPanelStyled>
        </TabContext>
      }
      onClose={currentDialogState.onClose}
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
