import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useState, type FC, type ChangeEventHandler, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { type ProductSelectOption, productApi } from '@/entities/product';
import { searchProductsByName } from '../lib/searchProductsByName';
import { FoundProductsList } from './FoundProductsList';
import { UploadImageButton } from './UploadImageButton';

const DEBOUNCE_QUERY_DELAY = 300;
const EMPTY_PRODUCTS: ProductSelectOption[] = [];

export const SearchProducts: FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_QUERY_DELAY);

  const { products } = productApi.useProductsAutocompleteQuery(null, {
    selectFromResult: ({ data }) => ({ products: data ?? EMPTY_PRODUCTS }),
  });

  const foundProducts = useMemo<ProductSelectOption[]>(
    () => searchProductsByName(products, debouncedQuery),
    [products, debouncedQuery],
  );

  const handleQueryChange: ChangeEventHandler<HTMLInputElement> = event => {
    setQuery(event.target.value);
  };

  const handleClear = (): void => {
    setQuery('');
  };

  return (
    <>
      <TextField
        fullWidth
        autoFocus
        variant="outlined"
        role="search"
        placeholder="Search products"
        margin="dense"
        value={query}
        onChange={handleQueryChange}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {query && (
                  <IconButton onClick={handleClear}>
                    <ClearIcon />
                  </IconButton>
                )}
                <UploadImageButton />
              </InputAdornment>
            ),
          },
        }}
      />
      <FoundProductsList foundProducts={foundProducts} query={debouncedQuery} />
    </>
  );
};
