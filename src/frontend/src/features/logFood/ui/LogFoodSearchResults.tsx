import { Box, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import { type FC, useMemo } from 'react';
import { foodLogModel } from '@/entities/foodLog';
import { type ProductSelectOption, productApi, productLib } from '@/entities/product';
import { toMealDraftProduct } from '../lib/mapping';

interface Props {
  query: string;
}

const EMPTY_PRODUCTS: ProductSelectOption[] = [];

export const LogFoodSearchResults: FC<Props> = ({ query }) => {
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
        <ListItem key={product.id} disableGutters>
          <ListItemText
            primary={product.name}
            secondary={`${product.defaultQuantity} g · ${foodLogModel.calculateCalories({ product, quantity: product.defaultQuantity })} kcal`}
          />
        </ListItem>
      ))}
    </List>
  );
};
