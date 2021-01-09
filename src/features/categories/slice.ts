import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OperationStatus } from '../__shared__/models';
import { AnyAsyncThunk, createAsyncThunkMatcher } from '../__shared__/utils';
import { CategoryItem } from './models';
import { createCategory, deleteCategory, editCategory, getCategories } from './thunks';

export type CategoriesState = {
  categoryItems: CategoryItem[];
  categoryItemsChangingStatus: OperationStatus;
};

const initialState: CategoriesState = {
  categoryItems: [],
  categoryItemsChangingStatus: 'idle',
};

const categoryItemsChangingThunks: AnyAsyncThunk[] = [createCategory, editCategory, deleteCategory];

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(getCategories.fulfilled, (state, { payload }: PayloadAction<CategoryItem[]>) => {
        state.categoryItems = payload;
      })
      .addMatcher(createAsyncThunkMatcher(categoryItemsChangingThunks, 'pending'), state => {
        state.categoryItemsChangingStatus = 'pending';
      })
      .addMatcher(createAsyncThunkMatcher(categoryItemsChangingThunks, 'fulfilled'), state => {
        state.categoryItemsChangingStatus = 'succeeded';
      })
      .addMatcher(createAsyncThunkMatcher(categoryItemsChangingThunks, 'rejected'), state => {
        state.categoryItemsChangingStatus = 'failed';
      }),
});

export const {} = categoriesSlice.actions;

export default categoriesSlice.reducer;
