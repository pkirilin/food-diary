import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CustomAutocomplete } from '../../__shared__/components';
import { SelectProps } from '../../__shared__/types';

import { ProductAutocompleteOption } from '../models';
import { getProductsAutocomplete } from '../thunks';

export type ProductSelectProps = SelectProps<ProductAutocompleteOption>;

export default function ProductSelect({
  label,
  placeholder,
  value = null,
  setValue,
}: ProductSelectProps) {
  // TODO: use local state or RTK Query cache
  const options = useSelector(state => state.products.autocompleteOptions);
  const isLoading = useSelector(state => state.products.autocompleteOptionsLoading);

  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      dispatch(getProductsAutocomplete());
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
