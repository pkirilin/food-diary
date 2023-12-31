import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type SelectOption } from 'src/types';
import { productsApi } from '../api';
import { type ProductItemsFilter } from './types';

export interface ProductsState {
  checkedProductIds: number[];
  filter: ProductItemsFilter;
}

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
      state.filter.pageNumber = initialState.filter.pageNumber;
      state.filter.pageSize = initialState.filter.pageSize;
    },
    filterByCategoryChanged: (state, { payload }: PayloadAction<SelectOption | null>) => {
      state.filter.category = payload;
      state.filter.changed = true;
      state.filter.pageNumber = initialState.filter.pageNumber;
      state.filter.pageSize = initialState.filter.pageSize;
    },
    filterReset: state => {
      state.filter = initialState.filter;
    },
  },
  extraReducers: builder =>
    builder
      .addMatcher(productsApi.endpoints.getProducts.matchFulfilled, state => {
        state.checkedProductIds = [];
      })
      .addMatcher(productsApi.endpoints.deleteProducts.matchFulfilled, state => {
        state.checkedProductIds = [];
      })
      .addMatcher(productsApi.endpoints.createProduct.matchPending, state => {
        state.filter = initialState.filter;
      })
      .addMatcher(productsApi.endpoints.editProduct.matchPending, state => {
        state.filter = initialState.filter;
      })
      .addMatcher(productsApi.endpoints.deleteProducts.matchPending, state => {
        state.filter = initialState.filter;
      }),
});

export const actions = productsSlice.actions;

export default productsSlice.reducer;
