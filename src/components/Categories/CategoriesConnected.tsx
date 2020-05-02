import { connect } from 'react-redux';
import Categories from './Categories';
import { Dispatch } from 'redux';
import { ClearProductsFilterAction } from '../../action-types';
import { clearProductsFilter } from '../../action-creators';

type CategoriesDispatch = Dispatch<ClearProductsFilterAction>;

export interface CategoriesDispatchToPropsMapResult {
  clearProductsFilter: () => void;
}

const mapDispatchToProps = (dispatch: CategoriesDispatch): CategoriesDispatchToPropsMapResult => {
  return {
    clearProductsFilter: (): void => {
      dispatch(clearProductsFilter());
    },
  };
};

export default connect(null, mapDispatchToProps)(Categories);
