import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OperationStatus } from '../__shared__/models';
import { CategoryItem } from './models';
import { getCategories } from './thunks';

export type CategoriesState = {
  categoryItems: CategoryItem[];
  categoryItemsChangingStatus: OperationStatus;
};

const initialState: CategoriesState = {
  categoryItems: [],
  categoryItemsChangingStatus: 'idle',
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder.addCase(
      getCategories.fulfilled,
      (state, { payload }: PayloadAction<CategoryItem[]>) => {
        state.categoryItems = payload;
      },
    ),
});

export const {} = categoriesSlice.actions;

export default categoriesSlice.reducer;
