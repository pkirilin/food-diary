import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SelectionPayload } from '../__shared__/types';
import { PageItem } from './models';
import { getPages } from './thunks';

export type PagesState = {
  pageItems: PageItem[];
  selectedPageIds: number[];
};

export interface SelectPagePayload extends SelectionPayload {
  pageId: number;
}

export type SelectAllPagesPayload = SelectionPayload;

const initialState: PagesState = {
  pageItems: [],
  selectedPageIds: [],
};

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    selectPage: (state, { payload }: PayloadAction<SelectPagePayload>) => {
      const { pageId, selected } = payload;
      if (selected) {
        state.selectedPageIds.push(pageId);
      } else {
        state.selectedPageIds = state.selectedPageIds.filter(id => id !== pageId);
      }
    },
    selectAllPages: (state, { payload }: PayloadAction<SelectAllPagesPayload>) => {
      const { selected } = payload;
      state.selectedPageIds = selected ? state.pageItems.map(p => p.id) : [];
    },
  },
  extraReducers: builder =>
    builder.addCase(getPages.fulfilled, (state, { payload }) => {
      state.pageItems = payload;
    }),
});

export const { selectPage, selectAllPages } = pagesSlice.actions;

export default pagesSlice.reducer;
