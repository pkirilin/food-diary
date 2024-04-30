import { TextField, type TextFieldProps } from '@mui/material';
import { useEffect, type FC, type FormEventHandler } from 'react';
import { type UseInputResult } from '@/hooks';
import { type ProductFormType } from '../model';

export interface ProductInputFormProps {
  id: string;
  product: ProductFormType;
  productNameInput: UseInputResult<string, TextFieldProps>;
  onSubmit: (values: ProductFormType) => void;
  onSubmitDisabledChange: (disabled: boolean) => void;
}

export const ProductInputForm: FC<ProductInputFormProps> = ({
  id,
  product,
  productNameInput,
  onSubmit,
  onSubmitDisabledChange,
}) => {
  const anyValueInvalid = productNameInput.isInvalid;
  const anyValueChanged = productNameInput.isTouched;

  useEffect(() => {
    onSubmitDisabledChange(anyValueInvalid || !anyValueChanged);
  }, [anyValueChanged, anyValueInvalid, onSubmitDisabledChange]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    onSubmit({
      ...product,
      name: productNameInput.value,
    });
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      <TextField
        {...productNameInput.inputProps}
        label="Name"
        placeholder="Product name"
        fullWidth
        autoFocus
      />
    </form>
  );
};
