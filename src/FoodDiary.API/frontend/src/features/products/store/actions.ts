import slice from './slice';

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
} = slice.actions;
