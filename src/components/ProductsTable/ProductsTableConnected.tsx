import { connect } from 'react-redux';
import ProductsTable from './ProductsTable';
import { ProductItem, ProductsFilter } from '../../models';
import { FoodDiaryState, DataFetchState } from '../../store';
import { GetProductsListSuccessAction, GetProductsListErrorAction, ProductsFilterActions } from '../../action-types';
import { ThunkDispatch } from 'redux-thunk';
import { getProducts, updateProductsFilter } from '../../action-creators';
import { Dispatch } from 'react';

export interface StateToPropsMapResult {
  productItemsFetchState: DataFetchState;
  isProductOperationInProcess: boolean;
  productItems: ProductItem[];
  productItemsPageSize: number;
  productsFilter: ProductsFilter;
  totalProductsCount: number;
}

export interface DispatchToPropsMapResult {
  getProducts: (productsFilter: ProductsFilter) => Promise<GetProductsListSuccessAction | GetProductsListErrorAction>;
  updateProductsFilter: (updatedFilter: ProductsFilter) => void;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    productItemsFetchState: state.products.list.productItemsFetchState,
    isProductOperationInProcess: state.products.operations.productOperationStatus.performing,
    productItems: state.products.list.productItems,
    productItemsPageSize: state.products.filter.pageSize,
    productsFilter: state.products.filter,
    totalProductsCount: state.products.list.totalProductsCount,
  };
};

type ProductsDispatchType = ThunkDispatch<
  ProductItem[],
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
