import { type FC } from 'react';
import { AppSelect } from 'src/components';
import { type SelectOption, type SelectProps } from 'src/types';
import { productsApi } from '../api';

const ProductSelect: FC<SelectProps<SelectOption>> = ({
  label,
  placeholder,
  value = null,
  setValue,
  helperText,
  isInvalid,
}) => {
  const [getOptions, getOptionsRequest] = productsApi.useLazyGetProductSelectOptionsQuery();

  const getDisplayName = (option: SelectOption): string => {
    return option.name;
  };

  const areOptionsEqual = (first: SelectOption, second: SelectOption): boolean => {
    return first.name === second.name;
  };

  const handleChange = (value: SelectOption | null): void => {
    setValue(value);
  };

  const handleOpen = (): void => {
    if (getOptionsRequest.isUninitialized) {
      void getOptions();
    }
  };

  return (
    <AppSelect
      availableOptions={getOptionsRequest.data ?? []}
      value={value}
      getDisplayName={getDisplayName}
      areOptionsEqual={areOptionsEqual}
      onChange={handleChange}
      onOpen={handleOpen}
      isLoading={getOptionsRequest.isLoading}
      isInvalid={isInvalid}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
    />
  );
};

export default ProductSelect;
