import { connect } from 'react-redux';
import Pages from './Pages';
import { FoodDiaryState } from '../../store';

export interface PagesStateToPropsMapResult {
  isPagesListAvailable: boolean;
  pagesCount: number;
}

const mapStateToProps = (state: FoodDiaryState): PagesStateToPropsMapResult => {
  return {
    isPagesListAvailable: state.pages.list.pageItemsFetchState.loaded,
    pagesCount: state.pages.list.pageItems.length,
  };
};

export default connect(mapStateToProps)(Pages);
