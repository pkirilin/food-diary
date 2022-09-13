import EditIcon from '@mui/icons-material/Edit';
import { Checkbox, IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../__shared__/hooks';
import { useEditProductMutation, useProductsQuery } from '../api';
import { ProductItem } from '../models';
import { selectCheckedProductIds, selectProductsQueryArg } from '../selectors';
import { productChecked, productUnchecked } from '../store';
import { ProductFormData } from '../types';
import { toProductFormData } from '../utils';
import ProductInputDialog from './ProductInputDialog';

type ProductsTableRowProps = {
  product: ProductItem;
};

const ProductsTableRow: React.FC<ProductsTableRowProps> = ({ product }: ProductsTableRowProps) => {
  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const productsQueryArg = useAppSelector(selectProductsQueryArg);
  const productsQuery = useProductsQuery(productsQueryArg);
  const [editProduct, editProductResult] = useEditProductMutation();
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const isChecked = checkedProductIds.some(id => id === product.id);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (editProductResult.isSuccess) {
      productsQuery.refetch();
      setIsEditDialogOpened(false);
    }
  }, [editProductResult.isSuccess, productsQuery]);

  function handleEditClick() {
    setIsEditDialogOpened(true);
  }

  function handleEditDialogSubmit({ name, caloriesCost, category }: ProductFormData) {
    editProduct({
      id: product.id,
      name,
      caloriesCost,
      categoryId: category.id,
    });
  }

  function handleCheckedChange() {
    if (isChecked) {
      dispatch(productUnchecked(product.id));
    } else {
      dispatch(productChecked(product.id));
    }
  }

  return (
    <React.Fragment>
      <TableRow>
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

      <ProductInputDialog
        isOpened={isEditDialogOpened}
        setIsOpened={setIsEditDialogOpened}
        title="Edit product"
        submitText="Save"
        onSubmit={handleEditDialogSubmit}
        isLoading={editProductResult.isLoading}
        product={toProductFormData(product)}
      />
    </React.Fragment>
  );
};

export default ProductsTableRow;
