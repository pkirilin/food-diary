import React, { useEffect } from 'react';
import { ProductsTableStateToPropsMapResult, ProductsTableDispatchToPropsMapResult } from './ProductsTableConnected';
import ProductsTableRowConnected from '../ProductsTableRow';
import { Pagination, Table, TableColumn, Preloader, Container } from '../__ui__';

interface ProductsTableProps extends ProductsTableStateToPropsMapResult, ProductsTableDispatchToPropsMapResult {
  refreshCategoriesOnDeleteProduct?: boolean;
}

const productsTableColumns = [
  <TableColumn key="Product name" name="Product name" width="50%"></TableColumn>,
  <TableColumn key="Calories" name="Calories" width="20%"></TableColumn>,
  <TableColumn key="Category" name="Category"></TableColumn>,
  <TableColumn key="Edit" name="" width="35px"></TableColumn>,
  <TableColumn key="Delete" name="" width="35px"></TableColumn>,
];

const ProductsTable: React.FC<ProductsTableProps> = ({
  refreshCategoriesOnDeleteProduct = false,
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

  const { loading: isProductsTableLoading, error: productsListError, loadingMessage } = productItemsFetchState;
  const isPaginationDisabled = isProductsTableLoading || isProductOperationInProcess || !!productsListError;

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
      rows.push(
        <ProductsTableRowConnected
          product={product}
          refreshCategoriesOnDeleteProduct={refreshCategoriesOnDeleteProduct}
        ></ProductsTableRowConnected>,
      );
    });
    return rows;
  };

  useEffect(() => {
    getProducts(productsFilter);
  }, [getProducts, productsFilter]);

  return (
    <Container direction="column" spaceBetweenChildren="medium">
      <Preloader isVisible={isProductsTableLoading} label={loadingMessage}>
        <Table
          columns={productsTableColumns}
          rows={mapProductItemsToTableRows()}
          dataErrorMessage={productsListError}
        ></Table>
      </Preloader>
      <Pagination
        totalPagesCount={totalPagesCount}
        maxVisiblePagesCount={10}
        isDisabled={isPaginationDisabled}
        currentPageNumber={productsFilter.pageNumber}
        onPageNumberUpdate={handlePageNumberUpdate}
      ></Pagination>
    </Container>
  );
};

export default ProductsTable;
