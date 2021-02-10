import { createSlice } from '@reduxjs/toolkit';
import { OperationStatus } from '../__shared__/models';
import { AnyAsyncThunk, createAsyncThunkMatcher } from '../__shared__/utils';
import { NoteItem } from './models';
import { createNote, deleteNote, editNote, getNotes } from './thunks';

export type NotesState = {
  noteItems: NoteItem[];
  noteItemsChangingStatus: OperationStatus;
};

const initialState: NotesState = {
  noteItems: [],
  noteItemsChangingStatus: 'idle',
};

const noteItemsChangingThunks: AnyAsyncThunk[] = [createNote, editNote, deleteNote];

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(getNotes.fulfilled, (state, { payload, meta }) => {
        const isRequestForAllMeals = meta.arg.mealType === undefined;

        state.noteItems = isRequestForAllMeals
          ? payload
          : [...state.noteItems.filter(n => n.mealType !== meta.arg.mealType), ...payload];
      })
      .addMatcher(createAsyncThunkMatcher(noteItemsChangingThunks, 'pending'), state => {
        state.noteItemsChangingStatus = 'pending';
      })
      .addMatcher(createAsyncThunkMatcher(noteItemsChangingThunks, 'fulfilled'), state => {
        state.noteItemsChangingStatus = 'succeeded';
      })
      .addMatcher(createAsyncThunkMatcher(noteItemsChangingThunks, 'rejected'), state => {
        state.noteItemsChangingStatus = 'failed';
      }),
});

export const {} = notesSlice.actions;

export default notesSlice.reducer;
