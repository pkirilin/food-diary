import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status } from '../__shared__/models';
import { createAsyncThunkMatcher } from '../__shared__/utils';
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
  operationStatus: Status;
};

const initialState: CategoriesState = {
  categoryItems: [],
  autocompleteOptions: [],
  operationStatus: 'idle',
};

const operationThunks = [createCategory, editCategory, deleteCategory];

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

export const { clearAutocompleteOptions } = categoriesSlice.actions;

export default categoriesSlice.reducer;
