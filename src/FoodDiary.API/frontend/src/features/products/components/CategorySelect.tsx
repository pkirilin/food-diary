import { useEffect, useState } from 'react';

import { useLazyGetCategoriesAutocompleteQuery } from 'src/api';
import { CustomAutocomplete } from 'src/features/__shared__/components';
import { SelectProps } from 'src/features/__shared__/types';
import { CategoryAutocompleteOption } from 'src/features/categories/models';

export type CategorySelectProps = SelectProps<CategoryAutocompleteOption>;

export default function CategorySelect({
  label,
  placeholder,
  value = null,
  setValue,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [getCategoriesAutocomplete, autocomplete] = useLazyGetCategoriesAutocompleteQuery();

  useEffect(() => {
    getCategoriesAutocomplete(isOpen);
  }, [isOpen]);

  return (
    <CustomAutocomplete
      label={label}
      placeholder={placeholder}
      options={autocomplete.data ?? []}
      loading={autocomplete.isLoading}
      open={isOpen}
      value={value}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={option => option.name}
      onChange={(event, value) => setValue(value)}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    ></CustomAutocomplete>
  );
}
