import { type FC } from 'react';
import { AppSelect } from 'src/components';
import { type SelectProps } from 'src/types';
import { type ProductSelectOption } from '../types';

interface ProductSelectProps extends SelectProps<ProductSelectOption> {
  options: ProductSelectOption[];
  optionsLoading: boolean;
}

const ProductSelect: FC<ProductSelectProps> = ({
  label,
  placeholder,
  value = null,
  setValue,
  helperText,
  isInvalid,
  autoFocus,
  options,
  optionsLoading,
}) => {
  const handleChange = (value: ProductSelectOption | null): void => {
    setValue(value);
  };

  return (
    <AppSelect
      options={options}
      value={value}
      onChange={handleChange}
      isLoading={optionsLoading}
      isInvalid={isInvalid}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      autoFocus={autoFocus}
    />
  );
};

export default ProductSelect;
