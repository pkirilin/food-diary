import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { type FC, useMemo } from 'react';
import { type ProductSelectOption, productApi, productLib } from '@/entities/product';
import { toMealDraftProduct } from '../lib/mapping';
import { FoundProductListItem } from './FoundProductListItem';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateProduct: (name: string) => void;
}

const EMPTY_PRODUCTS: ProductSelectOption[] = [];

export const LogFoodSearchResults: FC<Props> = ({ query, onQueryChange, onCreateProduct }) => {
  const { allProducts, isFetching } = productApi.useProductsAutocompleteQuery(null, {
    selectFromResult: ({ data, isFetching }) => ({
      allProducts: data ?? EMPTY_PRODUCTS,
      isFetching,
    }),
  });

  const foundProducts = useMemo(
    () => productLib.searchProductsByName(allProducts, query).map(toMealDraftProduct),
    [allProducts, query],
  );

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length >= productLib.QUERY_LENGTH_THRESHOLD;

  if (isSearching && isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isSearching && foundProducts.length === 0) {
    return (
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              onCreateProduct(trimmedQuery);
            }}
          >
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary={`Create "${trimmedQuery}"`} />
          </ListItemButton>
        </ListItem>
      </List>
    );
  }

  return (
    <List aria-label="Found products">
      {foundProducts.map(product => (
        <FoundProductListItem
          key={product.id}
          product={product}
          onFoodLogAdded={() => {
            onQueryChange('');
          }}
        />
      ))}
    </List>
  );
};
