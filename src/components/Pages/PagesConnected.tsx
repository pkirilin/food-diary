import { connect } from 'react-redux';
import Pages from './Pages';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  isPagesListAvailable: boolean;
  pagesCount: number;
  firstPageId?: number;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    isPagesListAvailable: state.pages.list.pageItems.loaded,
    pagesCount: state.pages.list.pageItems.data.length,
    firstPageId: state.pages.list.pageItems.data.filter(p => p.id > 0)[0]?.id,
  };
};

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(Pages);
