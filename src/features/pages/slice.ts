import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SortOrder, Status } from '../__shared__/models';
import { SelectionPayload } from '../__shared__/types';
import { createAsyncThunkMatcher } from '../__shared__/utils';
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

export type FilterChangedPayload = Pick<PageItemsFilter, 'startDate' | 'endDate' | 'sortOrder'>;

function changeFilter(
  state: PagesState,
  filterParams: Partial<Omit<PageItemsFilter, 'changed'>>,
  changed = true,
): void {
  state.filter = {
    ...state.filter,
    ...filterParams,
    changed,
  };
}

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
};

const operationThunks = [createPage, editPage, deletePages];

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
      changeFilter(state, { pageNumber: payload }, false);
    },
    pageSizeChanged: (state, { payload }: PayloadAction<number>) => {
      changeFilter(state, { pageSize: payload }, false);
    },
    startDateChanged: (state, { payload }: PayloadAction<string | undefined>) => {
      changeFilter(state, { startDate: payload });
    },
    endDateChanged: (state, { payload }: PayloadAction<string | undefined>) => {
      changeFilter(state, { endDate: payload });
    },
    sortOrderChanged: (state, { payload }: PayloadAction<SortOrder>) => {
      changeFilter(state, { sortOrder: payload });
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
  startDateChanged,
  endDateChanged,
  sortOrderChanged,
  filterReset,
} = pagesSlice.actions;

export default pagesSlice.reducer;
