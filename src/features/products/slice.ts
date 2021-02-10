import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OperationStatus } from '../__shared__/models';
import { SelectionPayload } from '../__shared__/types';
import { AnyAsyncThunk, createAsyncThunkMatcher } from '../__shared__/utils';
import {
  ProductAutocompleteOption,
  ProductItem,
  ProductItemsFilter,
  ProductsFilterUpdatedData,
} from './models';
import {
  createProduct,
  deleteProducts,
  editProduct,
  getProducts,
  getProductsAutocomplete,
} from './thunks';

export type ProductsState = {
  productItems: ProductItem[];
  totalProductsCount: number;
  productItemsChangingStatus: OperationStatus;
  selectedProductIds: number[];
  filter: ProductItemsFilter;
  autocompleteOptions: ProductAutocompleteOption[];
};

export interface SelectProductPayload extends SelectionPayload {
  productId: number;
}

export type SelectAllProductsPayload = SelectionPayload;

const initialState: ProductsState = {
  productItems: [],
  totalProductsCount: 0,
  productItemsChangingStatus: 'idle',
  selectedProductIds: [],
  filter: {
    changed: false,
    pageNumber: 1,
    pageSize: 10,
    category: null,
  },
  autocompleteOptions: [],
};

const productItemsChangingThunks: AnyAsyncThunk[] = [createProduct, editProduct, deleteProducts];

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
    filterUpdated: (state, { payload }: PayloadAction<ProductsFilterUpdatedData>) => {
      state.filter = {
        ...state.filter,
        ...payload,
      };
    },
    autocompleteOptionsDisposed: state => {
      state.autocompleteOptions = [];
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
      .addCase(getProductsAutocomplete.fulfilled, (state, { payload, meta }) => {
        const isAutocompleteActive = meta.arg;
        if (isAutocompleteActive) {
          state.autocompleteOptions = payload;
        }
      })
      .addMatcher(createAsyncThunkMatcher(productItemsChangingThunks, 'pending'), state => {
        state.productItemsChangingStatus = 'pending';
      })
      .addMatcher(createAsyncThunkMatcher(productItemsChangingThunks, 'fulfilled'), state => {
        state.productItemsChangingStatus = 'succeeded';
      })
      .addMatcher(createAsyncThunkMatcher(productItemsChangingThunks, 'rejected'), state => {
        state.productItemsChangingStatus = 'failed';
      }),
});

export const {
  productSelected,
  allProductsSelected,
  pageNumberChanged,
  pageSizeChanged,
  filterUpdated,
  autocompleteOptionsDisposed,
} = productsSlice.actions;

export default productsSlice.reducer;
