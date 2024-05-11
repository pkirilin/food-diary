import EditIcon from '@mui/icons-material/Edit';
import { Checkbox, IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { type FC } from 'react';
import { useAppDispatch } from '@/app/store';
import { type Product, productLib, productModel } from '@/entities/product';
import { EditProduct } from '@/features/product/addEdit';

interface ProductsTableRowProps {
  product: Product;
}

const ProductsTableRow: FC<ProductsTableRowProps> = ({ product }: ProductsTableRowProps) => {
  const dispatch = useAppDispatch();
  const checkedProductIds = productLib.useCheckedProductIds();
  const isChecked = checkedProductIds.some(id => id === product.id);

  const handleCheckedChange = (): void => {
    if (isChecked) {
      dispatch(productModel.actions.productUnchecked(product.id));
    } else {
      dispatch(productModel.actions.productChecked(product.id));
    }
  };

  return (
    <TableRow hover selected={isChecked}>
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={isChecked}
          onChange={handleCheckedChange}
          inputProps={{
            'aria-label': `Select ${product.name}`,
          }}
        />
      </TableCell>
      <TableCell>{product.name}</TableCell>
      <TableCell
        align="right"
        aria-label={`${product.name} calories cost is ${product.caloriesCost}`}
      >
        {product.caloriesCost}
      </TableCell>
      <TableCell
        align="right"
        aria-label={`${product.name} default quantity is ${product.defaultQuantity}`}
      >
        {product.defaultQuantity}
      </TableCell>
      <TableCell aria-label={`${product.name} is in ${product.categoryName} category`}>
        {product.categoryName}
      </TableCell>
      <TableCell>
        <EditProduct
          product={product}
          renderTrigger={openEditDialog => (
            <Tooltip title="Edit product">
              <span>
                <IconButton
                  onClick={openEditDialog}
                  size="large"
                  aria-label={`Open edit product dialog for ${product.name}`}
                >
                  <EditIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProductsTableRow;
