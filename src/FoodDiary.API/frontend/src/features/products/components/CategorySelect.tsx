import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CustomAutocomplete } from '../../__shared__/components';
import { SelectProps } from '../../__shared__/types';

import { CategoryAutocompleteOption } from '../../categories/models';
import { getCategoriesAutocomplete } from '../../categories/thunks';

export type CategorySelectProps = SelectProps<CategoryAutocompleteOption>;

export default function CategorySelect({
  label,
  placeholder,
  value = null,
  setValue,
}: CategorySelectProps) {
  // TODO: use local state or RTK Query cache
  const options = useSelector(state => state.categories.autocompleteOptions);
  const isLoading = useSelector(state => state.categories.autocompleteOptionsLoading);

  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      dispatch(getCategoriesAutocomplete());
    }
  }, [isOpen]);

  return (
    <CustomAutocomplete
      label={label}
      placeholder={placeholder}
      options={options}
      open={isOpen}
      loading={isLoading}
      value={value}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={option => option.name}
      onChange={(event, value) => setValue(value)}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    ></CustomAutocomplete>
  );
}
