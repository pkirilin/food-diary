import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CategoryAutocompleteOption } from '../../categories/models';
import { getCategoriesAutocomplete } from '../../categories/thunks';
import { CustomAutocomplete } from '../../__shared__/components';

export type CategorySelectProps = {
  setCategory: (value: CategoryAutocompleteOption | null) => void;
  category?: CategoryAutocompleteOption | null;
};

export default function CategorySelect({ setCategory, category = null }: CategorySelectProps) {
  const [options, setOptions] = useState<CategoryAutocompleteOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // TODO: use local state or RTK Query cache
  const optionsGlobal = useSelector(state => state.categories.autocompleteOptions);
  const isLoading = useSelector(state => state.categories.autocompleteOptionsLoading);
  const dispatch = useDispatch();

  useEffect(() => {
    setOptions(optionsGlobal);
  }, [optionsGlobal]);

  useEffect(() => {
    if (isOpen) {
      dispatch(getCategoriesAutocomplete(isOpen));
    }
  }, [isOpen]);

  return (
    <CustomAutocomplete
      options={options}
      open={isOpen}
      loading={isLoading}
      value={category}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={option => option.name}
      onChange={(event, value) => setCategory(value)}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      label="Category"
      placeholder="Select a category"
    ></CustomAutocomplete>
  );
}
