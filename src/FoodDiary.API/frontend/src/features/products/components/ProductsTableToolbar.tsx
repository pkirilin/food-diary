import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, IconButton, Popover, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { ConfirmationDialog } from '../../__shared__/components';
import { useAppDispatch, useDialog, usePopover, useAppSelector } from '../../__shared__/hooks';
import { ProductCreateEdit } from '../models';
import { createProduct, deleteProducts } from '../thunks';
import ProductCreateEditDialog from './ProductCreateEditDialog';
import ProductsFilter from './ProductsFilter';

const ProductsTableToolbar: React.FC = () => {
  const selectedProductIds = useAppSelector(state => state.products.selectedProductIds);

  const dispatch = useAppDispatch();

  const [filter, showFilter] = usePopover();

  const productCreateDialog = useDialog<ProductCreateEdit>(product => {
    dispatch(createProduct(product));
  });

  const productsDeleteDialog = useDialog(() => {
    dispatch(deleteProducts(selectedProductIds));
  });

  function handleDeleteClick() {
    productsDeleteDialog.show();
  }

  function handleFilterClick(event: React.MouseEvent<HTMLButtonElement>) {
    showFilter(event);
  }

  return (
    <Box paddingY={2}>
      <ProductCreateEditDialog {...productCreateDialog.binding} />
      <ConfirmationDialog
        {...productsDeleteDialog.binding}
        dialogTitle="Delete products confirmation"
        dialogMessage="Do you really want to delete selected products?"
      />
      {selectedProductIds.length > 0 ? (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box paddingX={2}>
            <Typography>{selectedProductIds.length} selected</Typography>
          </Box>
          <Box paddingX={2}>
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
        </Box>
      ) : (
        <React.Fragment>
          <Tooltip title="Filter products">
            <span>
              <IconButton
                onClick={handleFilterClick}
                size="large"
                aria-label="Open products filter"
              >
                <FilterListIcon />
              </IconButton>
            </span>
          </Tooltip>
        </React.Fragment>
      )}
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
    </Box>
  );
};

export default ProductsTableToolbar;
