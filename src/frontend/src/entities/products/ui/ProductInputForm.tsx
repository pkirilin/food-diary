import { TextField } from '@mui/material';
import { type FC } from 'react';
import { useInput } from '@/hooks';
import { mapToTextInputProps } from '@/utils/inputMapping';
import { validateProductName } from '@/utils/validation';
import { type ProductFormType } from '../model';

export interface ProductInputFormProps {
  values: ProductFormType;
  onValuesChange: (values: ProductFormType) => void;
}

export const ProductInputForm: FC<ProductInputFormProps> = ({ values, onValuesChange }) => {
  const { inputProps: productNameInputProps } = useInput({
    initialValue: values.name,
    errorHelperText: 'Product name is invalid',
    validate: validateProductName,
    mapToInputProps: mapToTextInputProps,
  });

  return (
    <TextField
      {...productNameInputProps}
      label="Name"
      placeholder="Product name"
      fullWidth
      autoFocus
      onChange={event => {
        if (productNameInputProps.onChange) {
          productNameInputProps.onChange(event);
        }

        onValuesChange({ ...values, name: event.target.value });
      }}
    />
  );
};
