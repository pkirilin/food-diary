import AddIcon from '@mui/icons-material/Add';
import {
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Box,
  ListItemIcon,
} from '@mui/material';
import { useMemo, type FC, type MouseEventHandler } from 'react';
import { useAppDispatch } from '@/app/store';
import { type ProductSelectOption, productApi, productModel } from '@/entities/product';
import { QUERY_LENGTH_THRESHOLD, searchProductsByName } from '../lib/searchProductsByName';
import { shouldSuggestAddingNewProduct } from '../lib/shouldSuggestAddingNewProduct';
import { actions } from '../model';

interface Props {
  query: string;
}

const EMPTY_PRODUCTS: ProductSelectOption[] = [];

export const ProductSearchResults: FC<Props> = ({ query }) => {
  const { allProducts, isFetching } = productApi.useProductsAutocompleteQuery(null, {
    selectFromResult: ({ data, isFetching }) => ({
      allProducts: data ?? EMPTY_PRODUCTS,
      isFetching,
    }),
  });

  const foundProducts = useMemo<ProductSelectOption[]>(
    () => searchProductsByName(allProducts, query),
    [allProducts, query],
  );

  const suggestAddingNewProduct = useMemo(
    () => shouldSuggestAddingNewProduct(foundProducts, query),
    [foundProducts, query],
  );

  const dispatch = useAppDispatch();

  const handleAddProduct: MouseEventHandler = () =>
    dispatch(
      actions.productDraftCreated({
        ...productModel.EMPTY_FORM_VALUES,
        name: query,
      }),
    );

  if (query.length >= QUERY_LENGTH_THRESHOLD && isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <List>
      {suggestAddingNewProduct && (
        <ListItem disableGutters disablePadding>
          <ListItemButton onClick={handleAddProduct}>
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText>{`Add "${query}"`}</ListItemText>
          </ListItemButton>
        </ListItem>
      )}
      {foundProducts.length > 0 && <ListSubheader disableGutters>Found products</ListSubheader>}
      {foundProducts.map(product => (
        <ListItem key={product.id} disableGutters disablePadding>
          <ListItemButton onClick={() => dispatch(actions.productSelected(product))}>
            <ListItemText>{product.name}</ListItemText>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};
