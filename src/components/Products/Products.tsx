import React, { useEffect } from 'react';
import './Products.scss';
import { ContentWrapper, MainContainer, SectionContainer, SectionTitle } from '../ContainerBlocks';
import ProductInputConnected from '../ProductInput';
import ProductsTableConnected from '../ProductsTable';
import Pagination from '../Pagination';
import { StateToPropsMapResult, DispatchToPropsMapResult } from './ProductsConnected';
import Loader from '../Loader';
import { useQuery } from '../../hooks';

interface ProductsProps extends StateToPropsMapResult, DispatchToPropsMapResult {}

const Products: React.FC<ProductsProps> = ({
  isProductsTableLoading,
  isProductOperationInProcess,
  productItems,
  productItemsPageSize,
  getProducts,
}: ProductsProps) => {
  const query = useQuery();
  const queryPageNumber = query.get('pageNumber');
  const currentPageNumberFromQuery = queryPageNumber !== null && !isNaN(+queryPageNumber) ? +queryPageNumber : null;
  const totalPagesCount = Math.ceil(productItems.length / productItemsPageSize);

  useEffect(() => {
    getProducts();
  }, [getProducts, currentPageNumberFromQuery]);

  const isPaginationDisabled = isProductsTableLoading || isProductOperationInProcess;

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
          ></Pagination>
        </SectionContainer>
      </MainContainer>
    </ContentWrapper>
  );
};

export default Products;
