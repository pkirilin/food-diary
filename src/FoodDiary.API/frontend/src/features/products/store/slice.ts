import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryAutocompleteOption } from 'src/features/categories';
import productsApi from '../api';
import { ProductItemsFilter } from './types';

export type ProductsState = {
  checkedProductIds: number[];
  filter: ProductItemsFilter;
};

const initialState: ProductsState = {
  checkedProductIds: [],
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
      state.checkedProductIds.push(payload);
    },

    productUnchecked: (state, { payload }: PayloadAction<number>) => {
      state.checkedProductIds = state.checkedProductIds.filter(id => id !== payload);
    },

    productsChecked: (state, { payload }: PayloadAction<number[]>) => {
      state.checkedProductIds = state.checkedProductIds
        .filter(id => payload.includes(id))
        .concat(payload);
    },

    productsUnchecked: (state, { payload }: PayloadAction<number[]>) => {
      state.checkedProductIds = state.checkedProductIds.filter(id => !payload.includes(id));
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
        state.checkedProductIds = [];
      })
      .addMatcher(productsApi.endpoints.deleteProducts.matchFulfilled, state => {
        state.checkedProductIds = [];
      }),
});

export const actions = productsSlice.actions;

export default productsSlice.reducer;
