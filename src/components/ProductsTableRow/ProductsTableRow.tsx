import React from 'react';
import './ProductsTableRow.scss';
import { ProductItem } from '../../models';

interface ProductsTableRowProps {
  product: ProductItem;
}

const ProductsTableRow: React.FC<ProductsTableRowProps> = ({ product }: ProductsTableRowProps) => {
  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.caloriesCost}</td>
      <td>{product.categoryName}</td>
      <td></td>
      <td></td>
    </tr>
  );
};

export default ProductsTableRow;
