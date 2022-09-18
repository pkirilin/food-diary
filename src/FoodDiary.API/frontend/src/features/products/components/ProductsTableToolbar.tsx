import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, IconButton, Popover, Tooltip, Typography } from '@mui/material';
import React, { useState } from 'react';
import { usePopover, useAppSelector } from '../../__shared__/hooks';
import { selectCheckedProductIds } from '../selectors';
import DeleteProductsDialog from './DeleteProductsDialog';
import ProductsFilter from './ProductsFilter';

const ProductsTableToolbar: React.FC = () => {
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const [filter, showFilter] = usePopover();
  const [isDeleteDialogOpened, setIsDeleteDialogOpened] = useState(false);

  function handleFilterClick(event: React.MouseEvent<HTMLButtonElement>) {
    showFilter(event);
  }

  function handleDeleteClick() {
    setIsDeleteDialogOpened(true);
  }

  function renderDeleteProducts() {
    return (
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography>{checkedProductIds.length} selected</Typography>
        <Tooltip title="Delete product">
          <IconButton
            onClick={handleDeleteClick}
            size="large"
            aria-label="Delete selected products"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  function renderFilterProducts() {
    return (
      <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h2">Products</Typography>
        <Tooltip title="Filter products">
          <span>
            <IconButton size="large" onClick={handleFilterClick} aria-label="Open products filter">
              <FilterListIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    );
  }

  return (
    <React.Fragment>
      {checkedProductIds.length > 0 ? renderDeleteProducts() : renderFilterProducts()}
      <DeleteProductsDialog isOpened={isDeleteDialogOpened} setIsOpened={setIsDeleteDialogOpened} />
      <Popover
        {...filter}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <ProductsFilter />
      </Popover>
    </React.Fragment>
  );
};

export default ProductsTableToolbar;
