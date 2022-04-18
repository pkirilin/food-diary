import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortOrder, Status } from '../__shared__/models';
import { SelectionPayload } from '../__shared__/types';
import { createAsyncThunkMatcher } from '../__shared__/utils';
import { Page, PageItem, PageItemsFilter } from './models';
import {
  createPage,
  deletePages,
  editPage,
  exportPagesToJson,
  getDateForNewPage,
  getPageById,
  getPages,
  importPages,
} from './thunks';

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
  dateForNewPage?: string;
  dateForNewPageLoading: Status;
  isExportToJsonLoading: boolean;
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
    sortOrder: SortOrder.Descending,
  },
  dateForNewPageLoading: 'idle',
  isExportToJsonLoading: false,
};

const operationThunks = [createPage, editPage, deletePages, importPages];

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
      .addCase(getPages.fulfilled, (state, { payload }) => {
        state.pageItems = payload.pageItems;
        state.totalPagesCount = payload.totalPagesCount;
      })
      .addCase(getPageById.fulfilled, (state, { payload }) => {
        state.current = payload.currentPage;

        if (state.filter.sortOrder === SortOrder.Ascending) {
          state.previous = payload.previousPage;
          state.next = payload.nextPage;
        } else {
          state.previous = payload.nextPage;
          state.next = payload.previousPage;
        }
      })
      .addCase(deletePages.fulfilled, state => {
        state.selectedPageIds = [];
      })
      .addCase(getDateForNewPage.pending, state => {
        state.dateForNewPageLoading = 'pending';
      })
      .addCase(getDateForNewPage.fulfilled, (state, { payload }) => {
        state.dateForNewPage = payload;
        state.dateForNewPageLoading = 'succeeded';
      })
      .addCase(getDateForNewPage.rejected, state => {
        state.dateForNewPageLoading = 'failed';
      })

      .addCase(exportPagesToJson.pending, state => {
        state.isExportToJsonLoading = true;
      })
      .addCase(exportPagesToJson.fulfilled, state => {
        state.isExportToJsonLoading = false;
      })
      .addCase(exportPagesToJson.rejected, state => {
        state.isExportToJsonLoading = false;
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
