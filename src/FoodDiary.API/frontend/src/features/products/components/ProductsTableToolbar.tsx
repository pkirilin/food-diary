import React from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Popover, Toolbar, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';
import DeleteIcon from '@material-ui/icons/Delete';
import { ConfirmationDialog } from '../../__shared__/components';
import { useDialog, usePopover, useTypedSelector } from '../../__shared__/hooks';
import { useToolbarStyles } from '../../__shared__/styles';
import ProductCreateEditDialog from './ProductCreateEditDialog';
import { ProductCreateEdit } from '../models';
import { createProduct, deleteProducts } from '../thunks';
import ProductsFilter from './ProductsFilter';

const ProductsTableToolbar: React.FC = () => {
  const classes = useToolbarStyles();

  const selectedProductIds = useTypedSelector(state => state.products.selectedProductIds);

  const dispatch = useDispatch();

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
      <ProductCreateEditDialog {...productCreateDialog.binding}></ProductCreateEditDialog>
      <ConfirmationDialog
        {...productsDeleteDialog.binding}
        dialogTitle="Delete products confirmation"
        dialogMessage="Do you really want to delete selected products?"
      ></ConfirmationDialog>
      {selectedProductIds.length > 0 ? (
        <React.Fragment>
          <Typography className={classes.title}>{selectedProductIds.length} selected</Typography>
          <Tooltip title="Delete product">
            <span>
              <IconButton onClick={handleDeleteClick}>
                <DeleteIcon></DeleteIcon>
              </IconButton>
            </span>
          </Tooltip>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography variant="h1" className={classes.title}>
            Products
          </Typography>
          <Tooltip title="Add new product">
            <span>
              <IconButton onClick={handleAddClick}>
                <AddIcon></AddIcon>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Filter products">
            <span>
              <IconButton
                onClick={event => {
                  showFilter(event);
                }}
              >
                <FilterListIcon></FilterListIcon>
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
        <ProductsFilter></ProductsFilter>
      </Popover>
    </Toolbar>
  );
};

export default ProductsTableToolbar;
