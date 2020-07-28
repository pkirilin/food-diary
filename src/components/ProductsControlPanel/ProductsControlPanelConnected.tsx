import { connect } from 'react-redux';
import ProductsControlPanel from './ProductsControlPanel';
import { Dispatch } from 'redux';
import { OpenModalAction, ClearProductsFilterAction } from '../../action-types';
import { ModalBody, ModalOptions, DataOperationState, RootState, DataFetchState } from '../../store';
import { openModal, clearProductsFilter } from '../../action-creators';

type ProductsControlPanelDispatch = Dispatch<OpenModalAction | ClearProductsFilterAction>;

export interface ProductsControlPanelStateToPropsMapResult {
  productOperationStatus: DataOperationState;
  productItemsFetchState: DataFetchState;
  isProductsFilterChanged: boolean;
}

export interface ProductsControlPanelDispatchToPropsMapResult {
  openModal: (title: string, body: ModalBody, options?: ModalOptions) => void;
  clearProductsFilter: () => void;
}

const mapStateToProps = (state: RootState): ProductsControlPanelStateToPropsMapResult => {
  return {
    productOperationStatus: state.products.operations.productOperationStatus,
    productItemsFetchState: state.products.list.productItemsFetchState,
    isProductsFilterChanged: state.products.filter.isChanged,
  };
};

const mapDispatchToProps = (dispatch: ProductsControlPanelDispatch): ProductsControlPanelDispatchToPropsMapResult => {
  return {
    openModal: (title: string, body: ModalBody, options?: ModalOptions): void => {
      dispatch(openModal(title, body, options));
    },

    clearProductsFilter: (): void => {
      dispatch(clearProductsFilter());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsControlPanel);
