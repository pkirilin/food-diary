import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CustomAutocomplete } from '../../__shared__/components';
import { ProductAutocompleteOption } from '../models';
import { getProductsAutocomplete } from '../thunks';

type ProductSelectProps = {
  product?: ProductAutocompleteOption | null;
  setProduct: (value: ProductAutocompleteOption | null) => void;
};

export default function ProductSelect({ product = null, setProduct }: ProductSelectProps) {
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
      options={options}
      open={isOpen}
      loading={isLoading}
      value={product}
      getOptionSelected={(option, value) => option.name === value.name}
      getOptionLabel={option => option.name}
      onChange={(event, value) => setProduct(value)}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      label="Product"
      placeholder="Select a product"
    ></CustomAutocomplete>
  );
}
