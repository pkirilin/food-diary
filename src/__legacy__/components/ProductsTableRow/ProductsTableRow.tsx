import React from 'react';
import './ProductsTableRow.scss';
import { ProductItem } from '../../models';
import {
  ProductsTableRowStateToPropsMapResult,
  ProductsTableRowDispatchToPropsMapResult,
} from './ProductsTableRowConnected';
import { ProductsOperationsActionTypes } from '../../action-types';
import { useProductInputDisabled, useHover } from '../../hooks';
import { Icon } from '../__ui__';
import ProductInputConnected from '../ProductInput';

interface ProductsTableRowProps
  extends ProductsTableRowStateToPropsMapResult,
    ProductsTableRowDispatchToPropsMapResult {
  product: ProductItem;
}

const ProductsTableRow: React.FC<ProductsTableRowProps> = ({
  product,
  isProductOperationInProcess,
  isCategoryOperationInProcess,
  productsFilter,
  getProducts,
  deleteProduct,
  openModal,
  openConfirmationModal,
}: ProductsTableRowProps) => {
  const isProductInputDisabled = useProductInputDisabled(isProductOperationInProcess, isCategoryOperationInProcess);
  const [areRowIconsVisible, handleRowMouseEnter, handleRowMouseLeave] = useHover();

  const runDeleteProductAsync = async (): Promise<void> => {
    const { type: deleteProductActionType } = await deleteProduct(product.id);

    if (deleteProductActionType === ProductsOperationsActionTypes.DeleteSuccess) {
      await getProducts(productsFilter);
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

  return (
    <tr onMouseEnter={handleRowMouseEnter} onMouseLeave={handleRowMouseLeave}>
      <td>{product.name}</td>
      <td>{product.caloriesCost}</td>
      <td>{product.categoryName}</td>
      {areRowIconsVisible ? (
        <React.Fragment>
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
        </React.Fragment>
      ) : (
        <React.Fragment>
          <td></td>
          <td></td>
        </React.Fragment>
      )}
    </tr>
  );
};

export default ProductsTableRow;
