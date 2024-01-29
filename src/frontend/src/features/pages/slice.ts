import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { SortOrder } from '../__shared__/models';
import { type SelectionPayload } from '../__shared__/types';
import { pagesApi } from './api';
import { type PageItem, type PageItemsFilter } from './models';

export interface PagesState {
  pageItems: PageItem[];
  selectedPageIds: number[];
  filter: PageItemsFilter;
}

export interface SelectPagePayload extends SelectionPayload {
  pageId: number;
}

export type SelectAllPagesPayload = SelectionPayload;

const initialState: PagesState = {
  pageItems: [],
  selectedPageIds: [],
  filter: {
    changed: false,
    pageNumber: 1,
    pageSize: 10,
    sortOrder: SortOrder.Descending,
  },
};

const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    pageSelected: (state, { payload }: PayloadAction<SelectPagePayload>) => {
      const { pageId, selected } = payload;
      if (selected) {
        state.selectedPageIds.push(pageId);
      } else {
        state.selectedPageIds = state.selectedPageIds.filter(id => id !== pageId);
      }
    },
    allPagesSelected: (state, { payload }: PayloadAction<SelectAllPagesPayload>) => {
      state.selectedPageIds = payload.selected ? state.pageItems.map(p => p.id) : [];
    },
    pageNumberChanged: (state, { payload }: PayloadAction<number>) => {
      state.filter.pageNumber = payload;
    },
    pageSizeChanged: (state, { payload }: PayloadAction<number>) => {
      state.filter.pageSize = payload;
    },
    startDateChanged: (state, { payload }: PayloadAction<string | undefined>) => {
      state.filter.startDate = payload;
      state.filter.changed = true;
    },
    endDateChanged: (state, { payload }: PayloadAction<string | undefined>) => {
      state.filter.endDate = payload;
      state.filter.changed = true;
    },
    sortOrderChanged: (state, { payload }: PayloadAction<SortOrder>) => {
      state.filter.sortOrder = payload;
      state.filter.changed = true;
    },
    filterReset: state => {
      state.filter.changed = false;
      state.filter.startDate = undefined;
      state.filter.endDate = undefined;
      state.filter.sortOrder = SortOrder.Descending;
    },
  },
  extraReducers: builder =>
    builder
      .addMatcher(pagesApi.endpoints.getPages.matchFulfilled, (state, { payload }) => {
        state.pageItems = payload.pageItems;
      })
      .addMatcher(pagesApi.endpoints.createPage.matchFulfilled, state => {
        state.selectedPageIds = [];
      })
      .addMatcher(pagesApi.endpoints.editPage.matchFulfilled, state => {
        state.selectedPageIds = [];
      })
      .addMatcher(pagesApi.endpoints.deletePages.matchFulfilled, state => {
        state.selectedPageIds = [];
      }),
});

export const {
  pageSelected,
  allPagesSelected,
  pageNumberChanged,
  pageSizeChanged,
  startDateChanged,
  endDateChanged,
  sortOrderChanged,
  filterReset,
} = pagesSlice.actions;

export default pagesSlice.reducer;
