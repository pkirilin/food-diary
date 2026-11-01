import { Box, CircularProgress, List } from '@mui/material';
import { type FC, useMemo } from 'react';
import { type ProductSelectOption, productApi, productLib } from '@/entities/product';
import { toMealDraftProduct } from '../lib/mapping';
import { FoundProductListItem } from './FoundProductListItem';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
}

const EMPTY_PRODUCTS: ProductSelectOption[] = [];

export const LogFoodSearchResults: FC<Props> = ({ query, onQueryChange }) => {
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

  if (query.trim().length >= productLib.QUERY_LENGTH_THRESHOLD && isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <CircularProgress />
      </Box>
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
