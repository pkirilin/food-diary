import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import SearchIcon from '@mui/icons-material/Search';
import {
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { useState, type FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { useAppDispatch } from '@/app/store';
import { type ProductSelectOption, productApi } from '@/entities/product';
import { actions } from './model';

interface FormValues {
  query: string;
}

// TODO: reduce duration
const DEBOUNCE_QUERY_DELAY = 500;

// TODO: add tests
export const SearchProducts: FC = () => {
  const { register, watch, formState } = useForm<FormValues>({
    mode: 'onTouched',
    defaultValues: {
      query: '',
    },
  });

  const { products } = productApi.useProductsAutocompleteQuery(null, {
    selectFromResult: ({ data }) => ({ products: data ?? [] }),
  });

  const query = watch('query');
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_QUERY_DELAY);
  const [visibleProducts, setVisibleProducts] = useState<ProductSelectOption[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (debouncedQuery.length > 0) {
      setVisibleProducts(
        products.filter(product =>
          product.name.trim().toLowerCase().includes(debouncedQuery.trim().toLowerCase()),
        ),
      );
    } else {
      setVisibleProducts([]);
    }
  }, [products, debouncedQuery, formState.touchedFields.query]);

  return (
    <>
      <TextField
        {...register('query')}
        fullWidth
        variant="outlined"
        type="search"
        placeholder="Search products"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end">
                  <InsertPhotoIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <List>
        {visibleProducts.length > 0 && <ListSubheader disableGutters>Search results</ListSubheader>}
        {visibleProducts.map(product => (
          <ListItem key={product.id} disableGutters disablePadding>
            <ListItemButton onClick={() => dispatch(actions.productSelected(product))}>
              <ListItemText>{product.name}</ListItemText>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );
};
