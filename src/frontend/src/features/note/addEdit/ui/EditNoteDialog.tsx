import { Box } from '@mui/material';
import { type FC } from 'react';
import { type noteModel } from '@/entities/note';
import { ProductAutocomplete } from '@/entities/product';
import { Button, Dialog } from '@/shared/ui';
import { type RenderDialogProps } from '../lib';
import { NoteInputForm } from './NoteInputForm';

interface Props extends RenderDialogProps {
  noteFormValues: noteModel.FormValues;
}

export const EditNoteDialog: FC<Props> = ({
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
  return (
    <Dialog
      disableContentPadding
      renderMode="fullScreenOnMobile"
      opened={opened}
      title="Edit note"
      content={
        <Box pt={3} pb={1} px={3}>
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
          Save
        </Button>
      )}
    />
  );
};
