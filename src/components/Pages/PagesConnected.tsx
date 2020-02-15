import { connect } from 'react-redux';
import Pages from './Pages';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  isPagesListAvailable: boolean;
  pagesCount: number;
  firstPageId?: number;
  isPageContentLoading: boolean;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    isPagesListAvailable: state.pages.list.pageItemsFetchState.loaded,
    pagesCount: state.pages.list.pageItems.length,
    firstPageId: state.pages.list.pageItems.filter(p => p.id > 0)[0]?.id,
    isPageContentLoading: state.notes.list.notesForPageFetchState.loading,
  };
};

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(Pages);
