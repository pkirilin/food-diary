import { connect } from 'react-redux';
import ProductsControlPanel from './ProductsControlPanel';
import { Dispatch } from 'redux';
import { OpenModalAction } from '../../action-types';
import { ModalBody, ModalOptions, DataOperationState, RootState, DataFetchState } from '../../store';
import { openModal } from '../../action-creators';

type ProductsControlPanelDispatch = Dispatch<OpenModalAction>;

export interface ProductsControlPanelStateToPropsMapResult {
  productOperationStatus: DataOperationState;
  productItemsFetchState: DataFetchState;
}

export interface ProductsControlPanelDispatchToPropsMapResult {
  openModal: (title: string, body: ModalBody, options?: ModalOptions) => void;
}

const mapStateToProps = (state: RootState): ProductsControlPanelStateToPropsMapResult => {
  return {
    productOperationStatus: state.products.operations.productOperationStatus,
    productItemsFetchState: state.products.list.productItemsFetchState,
  };
};

const mapDispatchToProps = (dispatch: ProductsControlPanelDispatch): ProductsControlPanelDispatchToPropsMapResult => {
  return {
    openModal: (title: string, body: ModalBody, options?: ModalOptions): void => {
      dispatch(openModal(title, body, options));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductsControlPanel);
