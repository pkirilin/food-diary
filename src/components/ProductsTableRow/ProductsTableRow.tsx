import React from 'react';
import './ProductsTableRow.scss';
import { ProductItem } from '../../models';
import {
  ProductsTableRowStateToPropsMapResult,
  ProductsTableRowDispatchToPropsMapResult,
} from './ProductsTableRowConnected';
import { ProductsOperationsActionTypes } from '../../action-types';
import { useProductInputDisabled } from '../../hooks';
import ProductsTableRowEditableConnected from './ProductsTableRowEditableConnected';
import { Icon } from '../__ui__';
import ProductInputConnected from '../ProductInput';

interface ProductsTableRowProps
  extends ProductsTableRowStateToPropsMapResult,
    ProductsTableRowDispatchToPropsMapResult {
  product: ProductItem;
  refreshCategoriesOnDeleteProduct?: boolean;
}

const ProductsTableRow: React.FC<ProductsTableRowProps> = ({
  product,
  refreshCategoriesOnDeleteProduct = false,
  editableProductsIds,
  isProductOperationInProcess,
  isCategoryOperationInProcess,
  productsFilter,
  getProducts,
  getCategories,
  deleteProduct,
  openModal,
  openConfirmationModal,
}: ProductsTableRowProps) => {
  const isProductEditable = editableProductsIds.some(id => id === product.id);
  const isProductInputDisabled = useProductInputDisabled(isProductOperationInProcess, isCategoryOperationInProcess);

  const runDeleteProductAsync = async (): Promise<void> => {
    const { type: deleteProductActionType } = await deleteProduct(product.id);

    if (deleteProductActionType === ProductsOperationsActionTypes.DeleteSuccess) {
      await getProducts(productsFilter);

      if (refreshCategoriesOnDeleteProduct) {
        await getCategories();
      }
    }
  };

  const handleEditIconClick = (): void => {
    openModal('Edit product', <ProductInputConnected product={product}></ProductInputConnected>, {
      width: '35%',
    });
  };

  const handleDeleteIconClick = (): void => {
    openConfirmationModal('Delete product', `Do you want to delete product "${product.name}"?`, () => {
      runDeleteProductAsync();
    });
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
        <Icon
          type="edit"
          size="small"
          title="Edit product"
          disabled={isProductInputDisabled}
          onClick={handleEditIconClick}
        ></Icon>
      </td>
      <td>
        <Icon
          type="close"
          size="small"
          title="Delete product"
          disabled={isProductInputDisabled}
          onClick={handleDeleteIconClick}
        ></Icon>
      </td>
    </tr>
  );
};

export default ProductsTableRow;
