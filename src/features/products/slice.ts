import { createSlice } from '@reduxjs/toolkit';
import { OperationStatus } from '../__shared__/models';
import { AnyAsyncThunk, createAsyncThunkMatcher } from '../__shared__/utils';
import { ProductItem } from './models';
import { createProduct, deleteProduct, editProduct, getProducts } from './thunks';

export type ProductsState = {
  productItems: ProductItem[];
  totalProductsCount: number;
  productItemsChangingStatus: OperationStatus;
};

const initialState: ProductsState = {
  productItems: [],
  totalProductsCount: 0,
  productItemsChangingStatus: 'idle',
};

const productItemsChangingThunks: AnyAsyncThunk[] = [createProduct, editProduct, deleteProduct];

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(getProducts.fulfilled, (state, { payload }) => {
        state.productItems = payload.productItems;
        state.totalProductsCount = payload.totalProductsCount;
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

export const {} = productsSlice.actions;

export default productsSlice.reducer;
