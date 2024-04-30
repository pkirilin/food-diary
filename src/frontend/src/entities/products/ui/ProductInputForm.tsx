import { TextField } from '@mui/material';
import { useEffect, type FC, type FormEventHandler } from 'react';
import { useInput } from '@/hooks';
import { mapToTextInputProps } from '@/utils/inputMapping';
import { validateProductName } from '@/utils/validation';
import { type ProductFormType } from '../model';

export interface ProductInputFormProps {
  id: string;
  product: ProductFormType;
  shouldClearValues: boolean;
  onSubmit: (values: ProductFormType) => void;
}

export const ProductInputForm: FC<ProductInputFormProps> = ({
  id,
  product,
  shouldClearValues,
  onSubmit,
}) => {
  const {
    value: productName,
    clearValue: clearProductName,
    inputProps: productNameProps,
  } = useInput({
    initialValue: product.name,
    errorHelperText: 'Product name is invalid',
    validate: validateProductName,
    mapToInputProps: mapToTextInputProps,
  });

  useEffect(() => {
    if (shouldClearValues) {
      clearProductName();
    }
  }, [clearProductName, shouldClearValues]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    onSubmit({
      ...product,
      name: productName,
    });
  };

  return (
    <form id={id} onSubmit={handleSubmit}>
      <TextField
        {...productNameProps}
        label="Name"
        placeholder="Product name"
        fullWidth
        autoFocus
      />
    </form>
  );
};
