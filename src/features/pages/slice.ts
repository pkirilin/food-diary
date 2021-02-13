import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status } from '../__shared__/models';
import { SelectionPayload } from '../__shared__/types';
import { AnyAsyncThunk, createAsyncThunkMatcher } from '../__shared__/utils';
import { Page, PageItem, PageItemsFilter } from './models';
import { createPage, deletePages, editPage, getPageById, getPages } from './thunks';

export type PagesState = {
  pageItems: PageItem[];
  operationStatus: Status;
  // TODO: add loadingState
  selectedPageIds: number[];
  totalPagesCount: number;
  filter: PageItemsFilter;
  current?: Page;
  previous?: Page;
  next?: Page;
};

export interface SelectPagePayload extends SelectionPayload {
  pageId: number;
}

export type SelectAllPagesPayload = SelectionPayload;

const initialState: PagesState = {
  pageItems: [],
  operationStatus: 'idle',
  selectedPageIds: [],
  totalPagesCount: 0,
  filter: {
    changed: false,
    pageNumber: 1,
    pageSize: 10,
  },
};

const operationThunks: AnyAsyncThunk[] = [createPage, editPage, deletePages];

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
    pageNumberChanged: (state, { payload }: PayloadAction<number>) => {
      state.filter.pageNumber = payload;
    },
    pageSizeChanged: (state, { payload }: PayloadAction<number>) => {
      state.filter.pageSize = payload;
    },
  },
  extraReducers: builder =>
    builder
      .addCase(getPages.fulfilled, (state, { payload }) => {
        state.pageItems = payload.pageItems;
        state.totalPagesCount = payload.totalPagesCount;
      })
      .addCase(getPageById.fulfilled, (state, { payload }) => {
        state.current = payload.currentPage;
        state.previous = payload.previousPage;
        state.next = payload.nextPage;
      })
      .addCase(deletePages.fulfilled, state => {
        state.selectedPageIds = [];
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
  selectPage,
  selectAllPages,
  pageNumberChanged,
  pageSizeChanged,
} = pagesSlice.actions;

export default pagesSlice.reducer;
