import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryAutocompleteOption } from '../categories/models';
import productsApi from './api';
import { ProductItemsFilter } from './models';

export type ProductsState = {
  selectedProductIds: number[];
  filter: ProductItemsFilter;
};

const initialState: ProductsState = {
  selectedProductIds: [],
  filter: {
    changed: false,
    pageNumber: 1,
    pageSize: 10,
    category: null,
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    productChecked: (state, { payload }: PayloadAction<number>) => {
      state.selectedProductIds.push(payload);
    },

    productUnchecked: (state, { payload }: PayloadAction<number>) => {
      state.selectedProductIds = state.selectedProductIds.filter(id => id !== payload);
    },

    productsChecked: (state, { payload }: PayloadAction<number[]>) => {
      state.selectedProductIds = state.selectedProductIds
        .filter(id => payload.includes(id))
        .concat(payload);
    },

    productsUnchecked: (state, { payload }: PayloadAction<number[]>) => {
      state.selectedProductIds = state.selectedProductIds.filter(id => !payload.includes(id));
    },

    pageNumberChanged: (state, { payload }: PayloadAction<number>) => {
      state.filter.pageNumber = payload;
    },
    pageSizeChanged: (state, { payload }: PayloadAction<number>) => {
      state.filter.pageSize = payload;
    },
    productSearchNameChanged: (state, { payload }: PayloadAction<string>) => {
      state.filter.productSearchName = payload;
      state.filter.changed = true;
    },
    filterByCategoryChanged: (
      state,
      { payload }: PayloadAction<CategoryAutocompleteOption | null>,
    ) => {
      state.filter.category = payload;
      state.filter.changed = true;
    },
    filterReset: state => {
      state.filter.productSearchName = undefined;
      state.filter.category = null;
      state.filter.changed = false;
    },
  },
  extraReducers: builder =>
    builder
      .addMatcher(productsApi.endpoints.products.matchFulfilled, state => {
        state.selectedProductIds = [];
      })
      .addMatcher(productsApi.endpoints.deleteProducts.matchFulfilled, state => {
        state.selectedProductIds = [];
      }),
});

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
} = productsSlice.actions;

export default productsSlice.reducer;
