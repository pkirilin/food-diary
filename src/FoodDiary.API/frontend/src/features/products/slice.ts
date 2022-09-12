import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SelectionPayload } from '../__shared__/types';
import { CategoryAutocompleteOption } from '../categories/models';
import productsApi from './api';
import { ProductItem, ProductItemsFilter } from './models';

export type ProductsState = {
  productItems: ProductItem[];
  selectedProductIds: number[];
  filter: ProductItemsFilter;
};

export interface SelectProductPayload extends SelectionPayload {
  productId: number;
}

export type SelectAllProductsPayload = SelectionPayload;

const initialState: ProductsState = {
  productItems: [],
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
    productSelected: (state, { payload }: PayloadAction<SelectProductPayload>) => {
      const { productId, selected } = payload;
      if (selected) {
        state.selectedProductIds.push(productId);
      } else {
        state.selectedProductIds = state.selectedProductIds.filter(id => id !== productId);
      }
    },
    allProductsSelected: (state, { payload }: PayloadAction<SelectAllProductsPayload>) => {
      state.selectedProductIds = payload.selected ? state.productItems.map(p => p.id) : [];
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
      .addMatcher(productsApi.endpoints.products.matchFulfilled, (state, { payload }) => {
        state.selectedProductIds = [];
        state.productItems = payload.productItems;
      })
      .addMatcher(productsApi.endpoints.deleteProducts.matchFulfilled, state => {
        state.selectedProductIds = [];
      }),
});

export const {
  productSelected,
  allProductsSelected,
  pageNumberChanged,
  pageSizeChanged,
  productSearchNameChanged,
  filterByCategoryChanged,
  filterReset,
} = productsSlice.actions;

export default productsSlice.reducer;
