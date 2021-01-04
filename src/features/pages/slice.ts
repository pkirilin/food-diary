import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SelectionPayload } from '../__shared__/types';
import { PageItem } from './models';

export type PagesState = {
  pageItems: PageItem[];
  selectedPageIds: number[];
};

export interface SelectPagePayload extends SelectionPayload {
  pageId: number;
}

export type SelectAllPagesPayload = SelectionPayload;

const testPages: PageItem[] = [
  {
    id: 1,
    date: new Date('2020-01-01').toLocaleDateString(),
    countCalories: 2000,
    countNotes: 10,
  },
  {
    id: 2,
    date: new Date('2020-01-02').toLocaleDateString(),
    countCalories: 2001,
    countNotes: 11,
  },
  {
    id: 3,
    date: new Date('2020-01-03').toLocaleDateString(),
    countCalories: 2002,
    countNotes: 12,
  },
];

const initialState: PagesState = {
  pageItems: testPages,
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
});

export const { selectPage, selectAllPages } = pagesSlice.actions;

export default pagesSlice.reducer;
