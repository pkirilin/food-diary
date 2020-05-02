import { connect } from 'react-redux';
import ProductsTable from './ProductsTable';
import { ProductItem, ProductsFilter } from '../../models';
import { FoodDiaryState, DataFetchState } from '../../store';
import { ProductsFilterActions, GetProductsListDispatch, GetProductsListDispatchProp } from '../../action-types';
import { getProducts, updateProductsFilter } from '../../action-creators';
import { Dispatch } from 'react';

type ProductsDispatchType = GetProductsListDispatch & Dispatch<ProductsFilterActions>;

export interface ProductsTableStateToPropsMapResult {
  productItemsFetchState: DataFetchState;
  isProductOperationInProcess: boolean;
  productItems: ProductItem[];
  productItemsPageSize: number;
  productsFilter: ProductsFilter;
  totalProductsCount: number;
}

export interface ProductsTableDispatchToPropsMapResult {
  updateProductsFilter: (updatedFilter: ProductsFilter) => void;
  getProducts: GetProductsListDispatchProp;
}

const mapStateToProps = (state: FoodDiaryState): ProductsTableStateToPropsMapResult => {
  return {
    productItemsFetchState: state.products.list.productItemsFetchState,
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    productItems: state.products.list.productItems,
    productItemsPageSize: state.products.filter.pageSize,
    productsFilter: state.products.filter,
    totalProductsCount: state.products.list.totalProductsCount,
  };
};

const mapDispatchToProps = (dispatch: ProductsDispatchType): ProductsTableDispatchToPropsMapResult => {
  const getProductsProp: GetProductsListDispatchProp = (productsFilter: ProductsFilter) => {
    return dispatch(getProducts(productsFilter));
  };

  return {
    updateProductsFilter: (updatedFilter: ProductsFilter): void => {
      dispatch(updateProductsFilter(updatedFilter));
    },

    getProducts: getProductsProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsTable);
