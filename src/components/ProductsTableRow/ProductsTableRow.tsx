import React from 'react';
import './ProductsTableRow.scss';
import { ProductItem } from '../../models';
import Icon from '../Icon';
import {
  ProductsTableRowStateToPropsMapResult,
  ProductsTableRowDispatchToPropsMapResult,
} from './ProductsTableRowConnected';
import { ProductsOperationsActionTypes } from '../../action-types';
import { useProductInputDisabled } from '../../hooks';
import ProductsTableRowEditableConnected from './ProductsTableRowEditableConnected';

interface ProductsTableRowProps
  extends ProductsTableRowStateToPropsMapResult,
    ProductsTableRowDispatchToPropsMapResult {
  product: ProductItem;
}

const ProductsTableRow: React.FC<ProductsTableRowProps> = ({
  product,
  editableProductsIds,
  isProductOperationInProcess,
  isCategoryOperationInProcess,
  productsFilter,
  setEditableForProduct,
  getProducts,
  getCategories,
  deleteProduct,
}: ProductsTableRowProps) => {
  const isProductEditable = editableProductsIds.some(id => id === product.id);
  const isProductInputDisabled = useProductInputDisabled(isProductOperationInProcess, isCategoryOperationInProcess);

  const handleEditIconClick = (): void => {
    setEditableForProduct(product.id, true);
  };

  const handleDeleteIconClick = async (): Promise<void> => {
    const isDeleteConfirmed = window.confirm('Do you want to delete product?');

    if (isDeleteConfirmed) {
      const { type: deleteProductActionType } = await deleteProduct(product.id);

      if (deleteProductActionType === ProductsOperationsActionTypes.DeleteSuccess) {
        await getProducts(productsFilter);
        await getCategories();
      }
    }
  };

  if (isProductEditable) {
    return <ProductsTableRowEditableConnected product={product}></ProductsTableRowEditableConnected>;
  }

  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.caloriesCost}</td>
      <td>{product.categoryName}</td>
      <td>
        <Icon type="edit" size="small" disabled={isProductInputDisabled} onClick={handleEditIconClick}></Icon>
      </td>
      <td>
        <Icon type="close" size="small" disabled={isProductInputDisabled} onClick={handleDeleteIconClick}></Icon>
      </td>
    </tr>
  );
};

export default ProductsTableRow;
