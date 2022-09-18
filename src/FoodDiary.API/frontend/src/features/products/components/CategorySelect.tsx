import React, { useEffect, useState } from 'react';
import { useLazyGetCategoriesAutocompleteQuery } from 'src/api';
import { CustomAutocomplete } from 'src/components';
import { CategoryAutocompleteOption } from 'src/features/categories';
import { AutocompleteOption, SelectProps } from 'src/types';

type CategorySelectProps = SelectProps<CategoryAutocompleteOption>;

const CategorySelect: React.FC<CategorySelectProps> = ({
  label,
  placeholder,
  value = null,
  setValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [getCategoriesAutocomplete, autocomplete] = useLazyGetCategoriesAutocompleteQuery();

  useEffect(() => {
    getCategoriesAutocomplete(isOpen);
  }, [getCategoriesAutocomplete, isOpen]);

  function isOptionEqualToValue(option: AutocompleteOption, value: AutocompleteOption) {
    return option.name === value.name;
  }

  function getOptionLabel(option: AutocompleteOption) {
    return option.name;
  }

  function handleChange(event: React.SyntheticEvent, value: AutocompleteOption | null) {
    setValue(value);
  }

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  return (
    <CustomAutocomplete
      label={label}
      placeholder={placeholder}
      options={autocomplete.data ?? []}
      loading={autocomplete.isLoading}
      open={isOpen}
      value={value}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionLabel={getOptionLabel}
      onChange={handleChange}
      onOpen={handleOpen}
      onClose={handleClose}
    />
  );
};

export default CategorySelect;
