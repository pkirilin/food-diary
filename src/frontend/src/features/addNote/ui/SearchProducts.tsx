import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
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
import { actions } from '../model';

interface FormValues {
  query: string;
}

const DEBOUNCE_QUERY_DELAY = 300;
const DEBOUNCE_QUERY_LENGTH_THRESHOLD = 3;
const EMPTY_PRODUCTS: ProductSelectOption[] = [];

// TODO: add tests
// TODO: desktop adaptation
export const SearchProducts: FC = () => {
  const { register, watch } = useForm<FormValues>({
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
  const [visibleProducts, setVisibleProducts] = useState<ProductSelectOption[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (debouncedQuery.trim().length >= DEBOUNCE_QUERY_LENGTH_THRESHOLD) {
      setVisibleProducts(
        products.filter(product =>
          product.name.trim().toLowerCase().includes(debouncedQuery.trim().toLowerCase()),
        ),
      );
    } else {
      setVisibleProducts([]);
    }
  }, [products, debouncedQuery]);

  return (
    <>
      <TextField
        {...register('query')}
        fullWidth
        variant="outlined"
        type="search"
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
                <IconButton
                  edge="end"
                  onClick={() => {
                    // TODO: add note from photo
                  }}
                >
                  <PhotoCameraIcon />
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
