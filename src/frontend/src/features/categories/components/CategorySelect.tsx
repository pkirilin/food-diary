import React from 'react';
import { AppSelect } from 'src/components';
import { SelectOption, SelectProps } from 'src/types';
import { useLazyCategorySelectOptionsQuery } from '../api';

const CategorySelect: React.FC<SelectProps<SelectOption>> = ({
  label,
  placeholder,
  value = null,
  setValue,
  helperText,
  isInvalid,
}) => {
  const [fetchOptions, { data: options, isLoading, isUninitialized }] =
    useLazyCategorySelectOptionsQuery();

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
    if (isUninitialized) {
      fetchOptions();
    }
  }

  return (
    <AppSelect
      availableOptions={options || []}
      value={value}
      getDisplayName={getDisplayName}
      areOptionsEqual={areOptionsEqual}
      onChange={handleChange}
      onOpen={handleOpen}
      isLoading={isLoading}
      isInvalid={isInvalid}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
    />
  );
};

export default CategorySelect;
