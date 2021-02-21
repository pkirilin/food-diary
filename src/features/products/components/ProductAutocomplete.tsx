import React from 'react';
import { useDispatch } from 'react-redux';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { useAsyncAutocomplete } from '../../__shared__/hooks';
import { AutocompleteCustomBaseProps } from '../../__shared__/types';
import { AutocompleteEndAdornment } from '../../__shared__/components';
import { ProductAutocompleteOption } from '../models';
import { autocompleteCleared } from '../slice';
import { getProductsAutocomplete } from '../thunks';

type ProductAutocompleteProps = AutocompleteCustomBaseProps<ProductAutocompleteOption>;

const ProductAutocomplete: React.FC<ProductAutocompleteProps> = ({
  value,
  onChange,
}: ProductAutocompleteProps) => {
  const dispatch = useDispatch();

  const { loading, binding } = useAsyncAutocomplete(
    { value, onChange },
    state => state.products.autocompleteOptions,
    active => {
      dispatch(getProductsAutocomplete(active));
    },
    () => {
      dispatch(autocompleteCleared());
    },
  );

  return (
    <Autocomplete
      {...binding}
      renderInput={params => (
        <TextField
          {...params}
          label="Product"
          placeholder="Select a product"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <AutocompleteEndAdornment
                loading={loading}
                params={params}
              ></AutocompleteEndAdornment>
            ),
          }}
        ></TextField>
      )}
      noOptionsText="No products found"
    ></Autocomplete>
  );
};

export default ProductAutocomplete;
