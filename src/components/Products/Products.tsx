import React, { useEffect } from 'react';
import './Products.scss';
import { ContentWrapper, MainContainer, SectionContainer, SectionTitle } from '../ContainerBlocks';
import ProductInputConnected from '../ProductInput';
import ProductsTableConnected from '../ProductsTable';
import Pagination from '../Pagination';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './ProductsConnected';
import Loader from '../Loader';

interface ProductsProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const Products: React.FC<ProductsProps> = ({
  isProductsTableLoading,
  isProductOperationInProcess,
  productItems,
  productItemsPageSize,
  productsFilter,
  getProducts,
  updateProductsFilter,
}: ProductsProps) => {
  const totalPagesCount = Math.ceil(productItems.length / productItemsPageSize);

  useEffect(() => {
    getProducts(productsFilter);
  }, [getProducts, productsFilter]);

  const isPaginationDisabled = isProductsTableLoading || isProductOperationInProcess;

  const handlePageNumberUpdate = (newPageNumber?: number): void => {
    if (newPageNumber !== productsFilter.pageNumber) {
      updateProductsFilter({
        ...productsFilter,
        pageNumber: newPageNumber,
      });
    }
  };

  return (
    <ContentWrapper>
      <MainContainer>
        <SectionContainer>
          <SectionTitle title="Products"></SectionTitle>
          <ProductInputConnected></ProductInputConnected>
          <div className="products">
            {isProductsTableLoading && (
              <div className="products__preloader">
                <Loader label="Loading products list"></Loader>
              </div>
            )}
            <ProductsTableConnected></ProductsTableConnected>
          </div>
          <Pagination
            totalPagesCount={totalPagesCount}
            maxVisiblePagesCount={10}
            isDisabled={isPaginationDisabled}
            marginTop="10px"
            onPageNumberUpdate={handlePageNumberUpdate}
          ></Pagination>
        </SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Products;
