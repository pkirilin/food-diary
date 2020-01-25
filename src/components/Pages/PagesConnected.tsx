import { connect } from 'react-redux';
import Pages from './Pages';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  isPagesListAvailable: boolean;
  firstPageId?: number;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    isPagesListAvailable: state.pages.list.pageItems.loaded,
    firstPageId: state.pages.list.pageItems.data[0]?.id,
  };
};

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(Pages);
