import React from 'react';
import './ProductsTable.scss';
import { Table, TableColumn } from '../Controls';

type ProductsTableProps = {};

const productsTableColumns = [
  <TableColumn key="Product name" name="Product name" width="30%"></TableColumn>,
  <TableColumn key="Calories" name="Calories" width="20%"></TableColumn>,
  <TableColumn key="Category" name="Category" width="30%"></TableColumn>,
  <TableColumn key="Edit" name="" width="35px"></TableColumn>,
  <TableColumn key="Delete" name="" width="35px"></TableColumn>,
];

const ProductsTable: React.FC<ProductsTableProps> = () => {
  const mapProductItemsToTableRows = (): JSX.Element[] => {
    return [];
  };

  return (
    <div className="products-table">
      <Table columns={productsTableColumns} rows={mapProductItemsToTableRows()}></Table>
    </div>
  );
};

export default ProductsTable;
