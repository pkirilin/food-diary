import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import {
  useState,
  type FC,
  type ChangeEventHandler,
  useEffect,
  type MouseEventHandler,
} from 'react';
import { useDebounce } from 'use-debounce';
import { useAppDispatch, useAppSelector } from 'src/store';
import { productSearchNameChanged } from '../store';
import * as styles from '../styles';

const DEBOUNCE_QUERY_DELAY = 500;
const DEBOUNCE_QUERY_LENGTH_THRESHOLD = 3;

export const SearchByName: FC = () => {
  const filterQuery = useAppSelector(state => state.products.filter.productSearchName ?? '');
  const filterChanged = useAppSelector(state => state.products.filter.changed);
  const [query, setQuery] = useState(filterQuery);
  const [queryTouched, setQueryTouched] = useState(false);
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_QUERY_DELAY);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!queryTouched) {
      return;
    }

    if (query === '') {
      dispatch(productSearchNameChanged(query));
      return;
    }

    if (debouncedQuery.length >= DEBOUNCE_QUERY_LENGTH_THRESHOLD) {
      dispatch(productSearchNameChanged(debouncedQuery));
    }
  }, [queryTouched, query, debouncedQuery, dispatch]);

  useEffect(() => {
    if (!filterChanged) {
      setQuery('');
      setQueryTouched(false);
    }
  }, [filterChanged]);

  const handleQueryChange: ChangeEventHandler<HTMLInputElement> = event => {
    setQuery(event.target.value);
    setQueryTouched(true);
  };

  const handleQueryClear: MouseEventHandler<HTMLButtonElement> = () => {
    setQuery('');
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
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: query ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleQueryClear}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
};
