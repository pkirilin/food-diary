import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OperationStatus } from '../__shared__/models';
import { AnyAsyncThunk, createAsyncThunkMatcher } from '../__shared__/utils';
import { CategoryAutocompleteOption, CategoryItem } from './models';
import {
  createCategory,
  deleteCategory,
  editCategory,
  getCategories,
  getCategoriesAutocomplete,
} from './thunks';

export type CategoriesState = {
  categoryItems: CategoryItem[];
  autocompleteOptions: CategoryAutocompleteOption[];
  categoryItemsChangingStatus: OperationStatus;
};

const initialState: CategoriesState = {
  categoryItems: [],
  autocompleteOptions: [],
  categoryItemsChangingStatus: 'idle',
};

const categoryItemsChangingThunks: AnyAsyncThunk[] = [createCategory, editCategory, deleteCategory];

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearAutocompleteOptions: state => {
      state.autocompleteOptions = [];
    },
  },
  extraReducers: builder =>
    builder
      .addCase(getCategories.fulfilled, (state, { payload }: PayloadAction<CategoryItem[]>) => {
        state.categoryItems = payload;
      })
      .addCase(getCategoriesAutocomplete.fulfilled, (state, { payload, meta }) => {
        const isAutocompleteActive = meta.arg;
        if (isAutocompleteActive) {
          state.autocompleteOptions = payload;
        }
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

export const { clearAutocompleteOptions } = categoriesSlice.actions;

export default categoriesSlice.reducer;
