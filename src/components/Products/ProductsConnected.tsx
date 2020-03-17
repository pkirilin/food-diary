import Products from './Products';
import { connect } from 'react-redux';
import { GetProductsListSuccessAction, GetProductsListErrorAction } from '../../action-types';
import { FoodDiaryState } from '../../store';
import { ThunkDispatch } from 'redux-thunk';
import { ProductItem } from '../../models';
import { getProducts } from '../../action-creators';

export interface StateToPropsMapResult {
  isProductsTableLoading: boolean;
  productItems: ProductItem[];
  productItemsPageSize: number;
}

export interface DispatchToPropsMapResult {
  getProducts: () => Promise<GetProductsListSuccessAction | GetProductsListErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    isProductsTableLoading: state.products.list.productItemsFetchState.loading,
    productItems: state.products.list.productItems,
    productItemsPageSize: state.products.list.pageSize,
  };
};

type ProductsDispatchType = ThunkDispatch<ProductItem, void, GetProductsListSuccessAction | GetProductsListErrorAction>;

const mapDispatchToProps = (dispatch: ProductsDispatchType): DispatchToPropsMapResult => {
  return {
    getProducts: (): Promise<GetProductsListSuccessAction | GetProductsListErrorAction> => {
      return dispatch(getProducts());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Products);
