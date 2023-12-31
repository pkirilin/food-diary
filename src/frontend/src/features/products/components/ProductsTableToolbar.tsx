import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState, type FC } from 'react';
import { useAppSelector } from '../../__shared__/hooks';
import { selectCheckedProductIds } from '../selectors';
import CreateProduct from './CreateProduct';
import DeleteProductsDialog from './DeleteProductsDialog';
import { SearchByCategory } from './SearchByCategory';
import { SearchByName } from './SearchByName';

const ProductsTableToolbar: FC = () => {
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const isSelectionActive = checkedProductIds.length > 0;

  const handleDeleteClick = (): void => {
    setIsDeleteDialogOpened(true);
  };

  return (
    <Box p={2}>
      {isSelectionActive && (
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography flexGrow={1}>{checkedProductIds.length} selected</Typography>
          <Tooltip title="Delete product">
            <IconButton
              onClick={handleDeleteClick}
              size="large"
              aria-label="Delete selected products"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
      {!isSelectionActive && (
        <Stack
          width="100%"
          spacing={{ xs: 3, sm: 2 }}
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Typography variant="h2" flexGrow={1}>
            Products
          </Typography>
          <Stack
            width="100%"
            flex={1}
            spacing={{ xs: 3, sm: 2 }}
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <SearchByName />
            <SearchByCategory />
            <CreateProduct />
          </Stack>
        </Stack>
      )}
      <DeleteProductsDialog isOpened={isDeleteDialogOpened} setIsOpened={setIsDeleteDialogOpened} />
    </Box>
  );
};

export default ProductsTableToolbar;
