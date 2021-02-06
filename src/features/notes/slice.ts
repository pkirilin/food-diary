import { createSlice } from '@reduxjs/toolkit';
import { getPageById } from '../pages/thunks';
import { NoteItem } from './models';

export type NotesState = {
  noteItems: NoteItem[];
};

const initialState: NotesState = {
  noteItems: [],
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder.addCase(getPageById.fulfilled, (state, { payload }) => {
      state.noteItems = payload.noteItems;
    }),
});

export const {} = notesSlice.actions;

export default notesSlice.reducer;
