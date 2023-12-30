import SearchIcon from '@mui/icons-material/Search';
import { TextField, InputAdornment } from '@mui/material';
import { useState, type FC, type ChangeEventHandler, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useAppDispatch } from 'src/store';
import { validateProductName } from 'src/utils/validation';
import { productSearchNameChanged } from '../store';
import * as styles from '../styles';

export const SearchByName: FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (debouncedQuery === '' || validateProductName(debouncedQuery)) {
      dispatch(productSearchNameChanged(debouncedQuery));
    }
  }, [debouncedQuery, dispatch]);

  const handleQueryChange: ChangeEventHandler<HTMLInputElement> = event => {
    setQuery(event.target.value);
  };

  return (
    <TextField
      size="small"
      placeholder="Search by name"
      value={query}
      onChange={handleQueryChange}
      sx={styles.searchField}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};
