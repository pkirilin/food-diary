import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useState, type FC } from 'react';
import { useDebounce } from 'use-debounce';
import { ProductSearchResults } from './ProductSearchResults';
import { UploadImagesButton } from './UploadImagesButton';

const DEBOUNCE_QUERY_DELAY = 300;

export const ProductSearch: FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_QUERY_DELAY);

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
        onChange={event => setQuery(event.target.value)}
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
                  <IconButton aria-label="Clear search" onClick={() => setQuery('')}>
                    <ClearIcon />
                  </IconButton>
                )}
                <UploadImagesButton />
              </InputAdornment>
            ),
          },
        }}
      />
      <ProductSearchResults query={debouncedQuery} />
    </>
  );
};
