import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status } from '../__shared__/models';
import { createAsyncThunkMatcher } from '../__shared__/utils';
import { CategoryItem } from './models';
import { createCategory, deleteCategory, editCategory, getCategories } from './thunks';

export type CategoriesState = {
  categoryItems: CategoryItem[];
  operationStatus: Status;
};

const initialState: CategoriesState = {
  categoryItems: [],
  operationStatus: 'idle',
};

const operationThunks = [createCategory, editCategory, deleteCategory];

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(getCategories.fulfilled, (state, { payload }: PayloadAction<CategoryItem[]>) => {
        state.categoryItems = payload;
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

export const {} = categoriesSlice.actions;

export default categoriesSlice.reducer;
