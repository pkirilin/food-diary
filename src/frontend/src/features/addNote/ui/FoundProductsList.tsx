import {
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Box,
} from '@mui/material';
import { type FC } from 'react';
import { useAppDispatch } from '@/app/store';
import { type ProductSelectOption, productApi } from '@/entities/product';
import { actions } from '../model';

interface Props {
  foundProducts: ProductSelectOption[];
}

export const FoundProductsList: FC<Props> = ({ foundProducts }) => {
  const { productsLoading } = productApi.useProductsAutocompleteQuery(null, {
    selectFromResult: ({ isLoading }) => ({ productsLoading: isLoading }),
  });

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
