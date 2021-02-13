import { createSlice } from '@reduxjs/toolkit';
import { Status } from '../__shared__/models';
import { AnyAsyncThunk, createAsyncThunkMatcher } from '../__shared__/utils';
import { NoteItem } from './models';
import { createNote, deleteNote, editNote, getNotes } from './thunks';

export type NotesState = {
  noteItems: NoteItem[];
  operationStatus: Status;
};

const initialState: NotesState = {
  noteItems: [],
  operationStatus: 'idle',
};

const operationThunks: AnyAsyncThunk[] = [createNote, editNote, deleteNote];

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

export const {} = notesSlice.actions;

export default notesSlice.reducer;
