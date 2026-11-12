import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { type FC, Fragment, useMemo } from 'react';
import { type ProductSelectOption, productApi, productLib } from '@/entities/product';
import { holdSoftKeyboardForNextField } from '@/shared/lib';
import { toMealDraftProduct } from '../lib/mapping';
import { FoundProductListItem } from './FoundProductListItem';

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  onCreateProduct: (name: string) => void;
  onOpenProduct: (productId: number) => void;
}

const EMPTY_PRODUCTS: ProductSelectOption[] = [];

export const LogFoodSearchResults: FC<Props> = ({
  query,
  onQueryChange,
  onCreateProduct,
  onOpenProduct,
}) => {
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

  const lowerCaseProductNames = useMemo(
    () => new Set(allProducts.map(product => product.name.trim().toLowerCase())),
    [allProducts],
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

  const createProductItem = (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => {
          holdSoftKeyboardForNextField();
          onCreateProduct(trimmedQuery);
        }}
      >
        <ListItemIcon>
          <AddIcon />
        </ListItemIcon>
        <ListItemText primary={`Create "${trimmedQuery}"`} />
      </ListItemButton>
    </ListItem>
  );

  if (isSearching && foundProducts.length === 0) {
    return <List>{createProductItem}</List>;
  }

  const isQueryAProductName = lowerCaseProductNames.has(trimmedQuery.toLowerCase());

  return (
    <List aria-label="Found products">
      {foundProducts.map((product, index) => (
        <Fragment key={product.id}>
          {index > 0 && <Divider variant="fullWidth" component="li" />}
          <FoundProductListItem
            product={product}
            onOpen={onOpenProduct}
            onFoodLogAdded={() => {
              onQueryChange('');
            }}
          />
        </Fragment>
      ))}
      {isSearching && !isQueryAProductName && (
        <>
          <Divider variant="fullWidth" component="li" />
          {createProductItem}
        </>
      )}
    </List>
  );
};
