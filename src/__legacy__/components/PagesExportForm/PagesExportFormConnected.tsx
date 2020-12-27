import { connect } from 'react-redux';
import PagesExportForm from './PagesExportForm';
import { DataOperationState, RootState } from '../../store';
import { ExportPagesDispatchProp, ExportPagesDispatch, CloseModalAction } from '../../action-types';
import { exportPages, closeModal } from '../../action-creators';
import { PagesExportRequest } from '../../models';
import { Dispatch } from 'redux';

type PagesExportFormDispatch = Dispatch<CloseModalAction> & ExportPagesDispatch;

export interface PagesExportFormStateToPropsMapResult {
  pageOperationStatus: DataOperationState;
}

export interface PagesExportFormDispatchToPropsMapResult {
  closeModal: () => void;
  exportPages: ExportPagesDispatchProp;
}

const mapStateToProps = (state: RootState): PagesExportFormStateToPropsMapResult => {
  return {
    pageOperationStatus: state.pages.operations.status,
  };
};

const mapDispatchToProps = (dispatch: PagesExportFormDispatch): PagesExportFormDispatchToPropsMapResult => {
  const exportPagesProp: ExportPagesDispatchProp = (request: PagesExportRequest) => {
    return dispatch(exportPages(request));
  };

  return {
    closeModal: (): void => {
      dispatch(closeModal());
    },

    exportPages: exportPagesProp,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PagesExportForm);
