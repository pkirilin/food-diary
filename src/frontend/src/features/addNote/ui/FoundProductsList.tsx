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
import { useMemo, type FC } from 'react';
import { useAppDispatch } from '@/app/store';
import { type ProductSelectOption, productApi } from '@/entities/product';
import { actions } from '../model';

interface Props {
  foundProducts: ProductSelectOption[];
  query: string;
}

export const FoundProductsList: FC<Props> = ({ foundProducts, query }) => {
  const { productsLoading } = productApi.useProductsAutocompleteQuery(null, {
    selectFromResult: ({ isLoading }) => ({ productsLoading: isLoading }),
  });

  // TODO: add tests
  const suggestAddingNewProduct = useMemo(
    () => query.trim().length > 0 && foundProducts.every(p => p.name !== query),
    [foundProducts, query],
  );

  const dispatch = useAppDispatch();

  if (foundProducts.length > 0 && productsLoading) {
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
          <ListItemButton onClick={() => dispatch(actions.productAdded(query))}>
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
