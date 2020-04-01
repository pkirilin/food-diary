import { connect } from 'react-redux';
import ProductsTable from './ProductsTable';
import { ProductItem, ProductsFilter } from '../../models';
import { FoodDiaryState } from '../../store';
import { GetProductsListSuccessAction, GetProductsListErrorAction, ProductsFilterActions } from '../../action-types';
import { ThunkDispatch } from 'redux-thunk';
import { getProducts, updateProductsFilter } from '../../action-creators';
import { Dispatch } from 'react';

export interface StateToPropsMapResult {
  isProductsTableLoading: boolean;
  isProductOperationInProcess: boolean;
  productItems: ProductItem[];
  productItemsPageSize: number;
  productsFilter: ProductsFilter;
}

export interface DispatchToPropsMapResult {
  getProducts: (productsFilter: ProductsFilter) => Promise<GetProductsListSuccessAction | GetProductsListErrorAction>;
  updateProductsFilter: (updatedFilter: ProductsFilter) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    isProductsTableLoading: state.products.list.productItemsFetchState.loading,
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    productItems: state.products.list.productItems,
    productItemsPageSize: state.products.filter.pageSize,
    productsFilter: state.products.filter,
  };
};

type ProductsDispatchType = ThunkDispatch<
  ProductItem,
  ProductsFilter,
  GetProductsListSuccessAction | GetProductsListErrorAction
> &
  Dispatch<ProductsFilterActions>;

const mapDispatchToProps = (dispatch: ProductsDispatchType): DispatchToPropsMapResult => {
  return {
    getProducts: (
      productsFilter: ProductsFilter,
    ): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
      return dispatch(getProducts(productsFilter));
    },
    updateProductsFilter: (updatedFilter: ProductsFilter): void => {
      dispatch(updateProductsFilter(updatedFilter));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsTable);
