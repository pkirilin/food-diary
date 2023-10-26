import React from 'react';
import { AppSelect } from 'src/components';
import { SelectOption, SelectProps } from 'src/types';
import { productsApi } from '../api';

const ProductSelect: React.FC<SelectProps<SelectOption>> = ({
  label,
  placeholder,
  value = null,
  setValue,
  helperText,
  isInvalid,
}) => {
  const [getOptions, getOptionsRequest] = productsApi.useLazyGetProductSelectOptionsQuery();

  function getDisplayName(option: SelectOption) {
    return option.name;
  }

  function areOptionsEqual(first: SelectOption, second: SelectOption) {
    return first.name === second.name;
  }

  function handleChange(value: SelectOption | null) {
    setValue(value);
  }

  function handleOpen() {
    if (getOptionsRequest.isUninitialized) {
      getOptions();
    }
  }

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
