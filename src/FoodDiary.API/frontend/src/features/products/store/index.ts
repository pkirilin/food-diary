import reducer, { actions } from './slice';

export const {
  productChecked,
  productUnchecked,
  productsChecked,
  productsUnchecked,
  pageNumberChanged,
  pageSizeChanged,
  productSearchNameChanged,
  filterByCategoryChanged,
  filterReset,
} = actions;

export default reducer;
