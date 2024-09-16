import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState, type FC } from 'react';
import { productLib } from '@/entities/product';
import { AddProduct } from '@/features/product/addEdit';
import DeleteProductsDialog from './DeleteProductsDialog';
import { SearchByCategory } from './SearchByCategory';
import { SearchByName } from './SearchByName';

const ProductsTableToolbar: FC = () => {
  const checkedProductIds = productLib.useCheckedProductIds();
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);
  const isSelectionActive = checkedProductIds.length > 0;

  const handleDeleteClick = (): void => {
    setIsDeleteDialogOpened(true);
  };

  return (
    <Box
      sx={{
        p: 2,
      }}
    >
      {isSelectionActive && (
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              flexGrow: 1,
            }}
          >
            {checkedProductIds.length} selected
          </Typography>
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
          spacing={{ xs: 3, sm: 2 }}
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            width: '100%',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="h2"
            sx={{
              flexGrow: 1,
            }}
          >
            Products
          </Typography>
          <Stack
            spacing={{ xs: 3, sm: 2 }}
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              width: '100%',
              flex: 1,
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
            }}
          >
            <SearchByName />
            <SearchByCategory />
            <AddProduct />
          </Stack>
        </Stack>
      )}
      <DeleteProductsDialog isOpened={isDeleteDialogOpened} setIsOpened={setIsDeleteDialogOpened} />
    </Box>
  );
};

export default ProductsTableToolbar;
