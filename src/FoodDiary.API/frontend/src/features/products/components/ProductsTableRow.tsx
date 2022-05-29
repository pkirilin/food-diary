import React from 'react';
import { Checkbox, IconButton, TableCell, TableRow, Tooltip } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { ProductCreateEdit, ProductItem } from '../models';
import ProductCreateEditDialog from './ProductCreateEditDialog';
import { editProduct } from '../thunks';
import { useAppDispatch, useDialog, useTypedSelector } from '../../__shared__/hooks';
import { productSelected } from '../slice';

type ProductsTableRowProps = {
  product: ProductItem;
};

const ProductsTableRow: React.FC<ProductsTableRowProps> = ({ product }: ProductsTableRowProps) => {
  const isProductSelected = useTypedSelector(state =>
    state.products.selectedProductIds.some(id => id === product.id),
  );

  const dispatch = useAppDispatch();

  const productEditDialog = useDialog<ProductCreateEdit>(productInfo => {
    dispatch(
      editProduct({
        id: product.id,
        product: productInfo,
      }),
    );
  });

  const handleEditClick = (): void => {
    productEditDialog.show();
  };

  const handleSelectProduct = (): void => {
    dispatch(
      productSelected({
        productId: product.id,
        selected: !isProductSelected,
      }),
    );
  };

  return (
    <TableRow>
      <ProductCreateEditDialog
        {...productEditDialog.binding}
        product={product}
      ></ProductCreateEditDialog>
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={isProductSelected}
          onChange={handleSelectProduct}
        ></Checkbox>
      </TableCell>
      <TableCell>{product.name}</TableCell>
      <TableCell>{product.caloriesCost}</TableCell>
      <TableCell>{product.categoryName}</TableCell>
      <TableCell>
        <Tooltip title="Edit product">
          <span>
            <IconButton onClick={handleEditClick}>
              <EditIcon></EditIcon>
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default ProductsTableRow;
