import { type FC } from 'react';
import { AppSelect } from 'src/components';
import { type SelectOption, type SelectProps } from 'src/types';
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
  const getDisplayName = (option: SelectOption): string => {
    return option.name;
  };

  const areOptionsEqual = (first: SelectOption, second: SelectOption): boolean => {
    return first.name === second.name;
  };

  const handleChange = (value: ProductSelectOption | null): void => {
    setValue(value);
  };

  return (
    <AppSelect
      availableOptions={options}
      value={value}
      getDisplayName={getDisplayName}
      areOptionsEqual={areOptionsEqual}
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
