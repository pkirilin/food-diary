import { TextField } from '@mui/material';
import { type FormEventHandler, type ChangeEventHandler, type FC } from 'react';
import { Button, Dialog } from '@/shared/ui';
import { type ProductFormType } from '../model';

interface Props {
  title: string;
  submitText: string;
  formId: string;
  opened: boolean;
  product: ProductFormType;
  handleClose: () => void;
  handleSubmit: FormEventHandler<HTMLFormElement>;
  handleProductNameChange: ChangeEventHandler<HTMLInputElement>;
}

export const ProductInputDialog: FC<Props> = ({
  title,
  submitText,
  formId,
  opened,
  product,
  handleClose,
  handleSubmit,
  handleProductNameChange,
}) => {
  return (
    <Dialog
      title={title}
      content={
        <form id={formId} onSubmit={handleSubmit}>
          <TextField
            label="Name"
            placeholder="Product name"
            value={product.name}
            onChange={handleProductNameChange}
            fullWidth
            autoFocus
          />
        </form>
      }
      opened={opened}
      onClose={handleClose}
      renderCancel={cancelProps => (
        <Button {...cancelProps} type="button" onClick={handleClose}>
          Cancel
        </Button>
      )}
      renderSubmit={submitProps => (
        <Button {...submitProps} type="submit" form={formId}>
          {submitText}
        </Button>
      )}
    />
  );
};
