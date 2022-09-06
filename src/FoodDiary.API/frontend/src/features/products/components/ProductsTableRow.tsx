import EditIcon from '@mui/icons-material/Edit';
import { Checkbox, IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import React from 'react';
import { useAppDispatch, useDialog, useAppSelector } from '../../__shared__/hooks';
import { ProductCreateEdit, ProductItem } from '../models';
import { productSelected } from '../slice';
import { editProduct } from '../thunks';
import ProductCreateEditDialog from './ProductCreateEditDialog';

type ProductsTableRowProps = {
  product: ProductItem;
};

const ProductsTableRow: React.FC<ProductsTableRowProps> = ({ product }: ProductsTableRowProps) => {
  const isProductSelected = useAppSelector(state =>
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
      <ProductCreateEditDialog {...productEditDialog.binding} product={product} />
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={isProductSelected}
          onChange={handleSelectProduct}
          inputProps={{
            'aria-label': `Select ${product.name}`,
          }}
        />
      </TableCell>
      <TableCell>{product.name}</TableCell>
      <TableCell aria-label={`${product.name} calories cost is ${product.caloriesCost}`}>
        {product.caloriesCost}
      </TableCell>
      <TableCell aria-label={`${product.name} is in ${product.categoryName} category`}>
        {product.categoryName}
      </TableCell>
      <TableCell>
        <Tooltip title="Edit product">
          <span>
            <IconButton
              onClick={handleEditClick}
              size="large"
              aria-label={`Open edit product dialog for ${product.name}`}
            >
              <EditIcon />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default ProductsTableRow;
