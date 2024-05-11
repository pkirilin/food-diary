import EditIcon from '@mui/icons-material/Edit';
import { Checkbox, IconButton, TableCell, TableRow, Tooltip } from '@mui/material';
import { type FC, useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { productApi, type productModel } from '@/entities/product';
import { toEditProductRequest, toProductFormData } from '../mapping';
import { useProducts } from '../model';
import { selectCheckedProductIds } from '../selectors';
import { productChecked, productUnchecked } from '../store';
import { type Product } from '../types';
import { ProductInputDialog } from './ProductInputDialog';

interface ProductsTableRowProps {
  product: Product;
}

const ProductsTableRow: FC<ProductsTableRowProps> = ({ product }: ProductsTableRowProps) => {
  const [isEditDialogOpened, setIsEditDialogOpened] = useState(false);
  const [editProduct, editProductRequest] = productApi.useEditProductMutation();
  const categorySelect = categoryLib.useCategorySelectData();
  const dispatch = useAppDispatch();
  const checkedProductIds = useAppSelector(selectCheckedProductIds);
  const isChecked = checkedProductIds.some(id => id === product.id);
  const products = useProducts();
  const productFormData = useMemo(() => toProductFormData(product), [product]);

  useEffect(() => {
    if (editProductRequest.isSuccess && products.isChanged) {
      setIsEditDialogOpened(false);
    }
  }, [editProductRequest.isSuccess, products.isChanged]);

  const handleEditClick = (): void => {
    setIsEditDialogOpened(true);
  };

  const handleEditDialogSubmit = (formData: productModel.FormValues): void => {
    if (formData.category) {
      const request = toEditProductRequest(product.id, formData.category.id, formData);
      void editProduct(request);
    }
  };

  const handleEditDialogClose = (): void => {
    setIsEditDialogOpened(false);
  };

  const handleCheckedChange = (): void => {
    if (isChecked) {
      dispatch(productUnchecked(product.id));
    } else {
      dispatch(productChecked(product.id));
    }
  };

  return (
    <>
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
        opened={isEditDialogOpened}
        title="Edit product"
        submitText="Save"
        isLoading={editProductRequest.isLoading || products.isFetching}
        product={productFormData}
        categories={categorySelect.data}
        categoriesLoading={categorySelect.isLoading}
        onSubmit={handleEditDialogSubmit}
        onClose={handleEditDialogClose}
      />
    </>
  );
};

export default ProductsTableRow;
