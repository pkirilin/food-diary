import SearchIcon from '@mui/icons-material/Search';
import { TextField, InputAdornment } from '@mui/material';
import { useState, type FC, type ChangeEventHandler, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useAppDispatch } from 'src/store';
import { validateProductName } from 'src/utils/validation';
import { productSearchNameChanged } from '../store';

const SearchByName: FC = () => {
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
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      sx={theme => ({
        minWidth: '200px',
        width: '100%',
        [theme.breakpoints.up('sm')]: {
          width: '200px',
        },
      })}
    />
  );
};

export default SearchByName;
