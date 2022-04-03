import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryAutocompleteOption } from '../categories/models';
import { Status } from '../__shared__/models';
import { SelectionPayload } from '../__shared__/types';
import { createAsyncThunkMatcher } from '../__shared__/utils';
import { ProductItem, ProductItemsFilter } from './models';
import { createProduct, deleteProducts, editProduct, getProducts } from './thunks';

export type ProductsState = {
  productItems: ProductItem[];
  totalProductsCount: number;
  operationStatus: Status;
  selectedProductIds: number[];
  filter: ProductItemsFilter;
};

export interface SelectProductPayload extends SelectionPayload {
  productId: number;
}

export type SelectAllProductsPayload = SelectionPayload;

const initialState: ProductsState = {
  productItems: [],
  totalProductsCount: 0,
  operationStatus: 'idle',
  selectedProductIds: [],
  filter: {
    changed: false,
    pageNumber: 1,
    pageSize: 10,
    category: null,
  },
};

const operationThunks = [createProduct, editProduct, deleteProducts];

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
      .addCase(getProducts.fulfilled, (state, { payload }) => {
        state.productItems = payload.productItems;
        state.totalProductsCount = payload.totalProductsCount;
      })
      .addCase(deleteProducts.fulfilled, state => {
        state.selectedProductIds = [];
      })

      .addMatcher(createAsyncThunkMatcher(operationThunks, 'pending'), state => {
        state.operationStatus = 'pending';
      })
      .addMatcher(createAsyncThunkMatcher(operationThunks, 'fulfilled'), state => {
        state.operationStatus = 'succeeded';
      })
      .addMatcher(createAsyncThunkMatcher(operationThunks, 'rejected'), state => {
        state.operationStatus = 'failed';
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
