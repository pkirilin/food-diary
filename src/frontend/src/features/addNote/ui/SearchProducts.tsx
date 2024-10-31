import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useState, type FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { type ProductSelectOption, productApi } from '@/entities/product';
import { searchProductsByName } from '../lib/searchProductsByName';
import { FoundProductsList } from './FoundProductsList';
import { UploadImageButton } from './UploadImageButton';

interface FormValues {
  query: string;
}

const DEBOUNCE_QUERY_DELAY = 300;
const EMPTY_PRODUCTS: ProductSelectOption[] = [];

export const SearchProducts: FC = () => {
  const { register, watch, reset } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      query: '',
    },
  });

  const { products } = productApi.useProductsAutocompleteQuery(null, {
    selectFromResult: ({ data }) => ({ products: data ?? EMPTY_PRODUCTS }),
  });

  const query = watch('query');
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_QUERY_DELAY);
  const [foundProducts, setFoundProducts] = useState<ProductSelectOption[]>([]);

  useEffect(() => {
    setFoundProducts(searchProductsByName(products, debouncedQuery));
  }, [products, debouncedQuery]);

  return (
    <>
      <TextField
        {...register('query')}
        fullWidth
        autoFocus
        variant="outlined"
        role="search"
        placeholder="Search products"
        margin="dense"
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
                  <IconButton onClick={() => reset()}>
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
