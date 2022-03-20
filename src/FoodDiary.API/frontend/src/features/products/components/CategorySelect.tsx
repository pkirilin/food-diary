import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CategoryAutocompleteOption } from '../../categories/models';
import { autocompleteCleared } from '../../categories/slice';
import { getCategoriesAutocomplete } from '../../categories/thunks';
import { CustomAutocomplete } from '../../__shared__/components';

export type CategorySelectProps = {
  category: CategoryAutocompleteOption | null;
};

export default function CategorySelect({ category }: CategorySelectProps) {
  const [options, setOptions] = useState<CategoryAutocompleteOption[]>([]);
  const [selectedOption, setSelectedOption] = useState(category);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading] = useState(false);

  // TODO: use local state or RTK Query cache
  const optionsGlobal = useSelector(state => state.categories.autocompleteOptions);
  const dispatch = useDispatch();

  useEffect(() => {
    setOptions(optionsGlobal);
  }, [optionsGlobal]);

  useEffect(() => {
    // TODO: can be removed if RTK Query is used
    let active = true;

    if (!isLoading) {
      return;
    }

    dispatch(getCategoriesAutocomplete(active));

    return () => {
      active = false;
    };
  }, [isLoading]);

  useEffect(() => {
    if (!isOpen) {
      dispatch(autocompleteCleared());
    }
  }, [isOpen]);

  return (
    <CustomAutocomplete
      options={options}
      open={isOpen}
      loading={isLoading}
      value={selectedOption}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={option => option.name}
      onChange={(event, value) => setSelectedOption(value)}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      label="Category"
      placeholder="Select a category"
    ></CustomAutocomplete>
  );
}
