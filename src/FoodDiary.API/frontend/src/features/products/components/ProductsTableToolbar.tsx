import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { IconButton, Popover, Toolbar, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { ConfirmationDialog } from '../../__shared__/components';
import { useAppDispatch, useDialog, usePopover, useAppSelector } from '../../__shared__/hooks';
import { useToolbarStyles } from '../../__shared__/styles';
import { ProductCreateEdit } from '../models';
import { createProduct, deleteProducts } from '../thunks';
import ProductCreateEditDialog from './ProductCreateEditDialog';
import ProductsFilter from './ProductsFilter';

const ProductsTableToolbar: React.FC = () => {
  const classes = useToolbarStyles();

  const selectedProductIds = useAppSelector(state => state.products.selectedProductIds);

  const dispatch = useAppDispatch();

  const [filter, showFilter] = usePopover();

  const productCreateDialog = useDialog<ProductCreateEdit>(product => {
    dispatch(createProduct(product));
  });

  const productsDeleteDialog = useDialog(() => {
    dispatch(deleteProducts(selectedProductIds));
  });

  const handleAddClick = (): void => {
    productCreateDialog.show();
  };

  const handleDeleteClick = (): void => {
    productsDeleteDialog.show();
  };

  return (
    <Toolbar className={classes.root}>
      <ProductCreateEditDialog {...productCreateDialog.binding} />
      <ConfirmationDialog
        {...productsDeleteDialog.binding}
        dialogTitle="Delete products confirmation"
        dialogMessage="Do you really want to delete selected products?"
      />
      {selectedProductIds.length > 0 ? (
        <React.Fragment>
          <Typography className={classes.title}>{selectedProductIds.length} selected</Typography>
          <Tooltip title="Delete product">
            <span>
              <IconButton
                onClick={handleDeleteClick}
                size="large"
                aria-label="Delete selected products"
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography variant="h1" className={classes.title}>
            Products
          </Typography>
          <Tooltip title="Create new product">
            <span>
              <IconButton
                onClick={handleAddClick}
                size="large"
                aria-label="Open create product dialog"
              >
                <AddIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Filter products">
            <span>
              <IconButton
                onClick={event => {
                  showFilter(event);
                }}
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
    </Toolbar>
  );
};

export default ProductsTableToolbar;
