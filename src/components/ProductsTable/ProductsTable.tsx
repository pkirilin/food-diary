import React, { useEffect } from 'react';
import './ProductsTable.scss';
import { Table, TableColumn } from '../Controls';
import { ProductsTableStateToPropsMapResult, ProductsTableDispatchToPropsMapResult } from './ProductsTableConnected';
import ProductsTableRowConnected from '../ProductsTableRow';
import Loader from '../Loader';
import Pagination from '../Pagination';

interface ProductsTableProps extends ProductsTableStateToPropsMapResult, ProductsTableDispatchToPropsMapResult {}

const productsTableColumns = [
  <TableColumn key="Product name" name="Product name" width="50%"></TableColumn>,
  <TableColumn key="Calories" name="Calories" width="20%"></TableColumn>,
  <TableColumn key="Category" name="Category"></TableColumn>,
  <TableColumn key="Edit" name="" width="35px"></TableColumn>,
  <TableColumn key="Delete" name="" width="35px"></TableColumn>,
];

const ProductsTable: React.FC<ProductsTableProps> = ({
  productItemsFetchState,
  isProductOperationInProcess,
  productItems,
  productItemsPageSize,
  productsFilter,
  totalProductsCount,
  updateProductsFilter,
  getProducts,
}: ProductsTableProps) => {
  const totalPagesCount = Math.ceil(totalProductsCount / productItemsPageSize);

  const { loading: isProductsTableLoading, error: productsListError } = productItemsFetchState;
  const isPaginationDisabled = isProductsTableLoading || isProductOperationInProcess || productsListError !== undefined;

  const handlePageNumberUpdate = (newPageNumber?: number): void => {
    if (newPageNumber !== productsFilter.pageNumber) {
      updateProductsFilter({
        ...productsFilter,
        pageNumber: newPageNumber,
      });
    }
  };

  const mapProductItemsToTableRows = (): JSX.Element[] => {
    const rows: JSX.Element[] = [];
    productItems.forEach(product => {
      rows.push(<ProductsTableRowConnected product={product}></ProductsTableRowConnected>);
    });
    return rows;
  };

  useEffect(() => {
    getProducts(productsFilter);
  }, [getProducts, productsFilter]);

  return (
    <React.Fragment>
      <div className="products">
        {isProductsTableLoading && (
          <div className="products__preloader">
            <Loader label="Loading products list"></Loader>
          </div>
        )}
        <div className="products-table">
          <Table
            columns={productsTableColumns}
            rows={mapProductItemsToTableRows()}
            dataErrorMessage={productsListError}
          ></Table>
        </div>
      </div>
      <Pagination
        totalPagesCount={totalPagesCount}
        maxVisiblePagesCount={10}
        isDisabled={isPaginationDisabled}
        marginTop="10px"
        currentPageNumber={productsFilter.pageNumber}
        onPageNumberUpdate={handlePageNumberUpdate}
      ></Pagination>
    </React.Fragment>
  );
};

export default ProductsTable;
