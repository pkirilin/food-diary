import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { productApi } from '@/entities/product';
import { type SelectOption } from '@/shared/types';
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
      .addMatcher(productApi.endpoints.getProducts.matchFulfilled, state => {
        state.checkedProductIds = [];
      })
      .addMatcher(productApi.endpoints.deleteProducts.matchFulfilled, state => {
        state.checkedProductIds = [];
      }),
});

export const actions = productsSlice.actions;

export default productsSlice.reducer;
