import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Toolbar, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';
import { useToolbarStyles } from '../../__shared__/styles';
import ProductCreateEditDialog from './ProductCreateEditDialog';
import ProductsFilterDialog from './ProductsFilterDialog';
import { ProductCreateEdit } from '../models';
import { createProduct } from '../thunks';

const ProductsTableToolbar: React.FC = () => {
  const classes = useToolbarStyles();
  const [productCreateEditDialogOpen, setProductCreateEditDialogOpen] = useState(false);
  const [productsFilterDialogOpen, setProductsFilterDialogOpen] = useState(false);

  const dispatch = useDispatch();

  const handleAddClick = (): void => {
    setProductCreateEditDialogOpen(true);
  };

  const handleFilterClick = (): void => {
    setProductsFilterDialogOpen(true);
  };

  const handleCreateEditDialogConfirm = (product: ProductCreateEdit): void => {
    setProductCreateEditDialogOpen(false);
    dispatch(createProduct(product));
  };

  const handleFilterDialogConfirm = (): void => {
    setProductsFilterDialogOpen(false);
  };

  const handleCreateEditDialogClose = (): void => {
    setProductCreateEditDialogOpen(false);
  };

  const handleFilterDialogClose = (): void => {
    setProductsFilterDialogOpen(false);
  };

  return (
    <Toolbar className={classes.root}>
      <ProductCreateEditDialog
        open={productCreateEditDialogOpen}
        onClose={handleCreateEditDialogClose}
        onDialogConfirm={handleCreateEditDialogConfirm}
        onDialogCancel={handleCreateEditDialogClose}
      ></ProductCreateEditDialog>
      <ProductsFilterDialog
        open={productsFilterDialogOpen}
        onClose={handleFilterDialogClose}
        onDialogConfirm={handleFilterDialogConfirm}
        onDialogCancel={handleFilterDialogClose}
      ></ProductsFilterDialog>
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
          <IconButton onClick={handleFilterClick}>
            <FilterListIcon></FilterListIcon>
          </IconButton>
        </span>
      </Tooltip>
    </Toolbar>
  );
};

export default ProductsTableToolbar;
