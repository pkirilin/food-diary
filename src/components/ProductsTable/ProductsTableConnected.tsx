import { connect } from 'react-redux';
import ProductsTable from './ProductsTable';
import { ProductItem } from '../../models';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  productItems: ProductItem[];
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    productItems: state.products.list.productItems,
  };
};

export default connect(mapStateToProps)(ProductsTable);
