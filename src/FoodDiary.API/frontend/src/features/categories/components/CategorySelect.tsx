import React from 'react';
import { AppSelect } from 'src/components';
import { CategorySelectOption } from 'src/features/categories';
import { SelectProps } from 'src/types';
import { useLazyCategorySelectOptionsQuery } from '../api';

export type CategorySelectProps = SelectProps<CategorySelectOption>;

const CategorySelect: React.FC<CategorySelectProps> = ({
  label,
  placeholder,
  value = null,
  setValue,
  helperText,
  isInvalid,
}) => {
  const [fetchOptions, { data: options, isLoading, isUninitialized }] =
    useLazyCategorySelectOptionsQuery();

  function getDisplayName(option: CategorySelectOption) {
    return option.name;
  }

  function areOptionsEqual(first: CategorySelectOption, second: CategorySelectOption) {
    return first.name === second.name;
  }

  function handleChange(value: CategorySelectOption | null) {
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
