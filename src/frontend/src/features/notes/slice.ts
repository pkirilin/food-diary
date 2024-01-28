import { createSlice } from '@reduxjs/toolkit';
import { type Status } from '../__shared__/models';
import { type AnyAsyncThunk, createAsyncThunkMatcher } from '../__shared__/utils';
import { MealType } from './models';
import { createNote, deleteNote, editNote, type NoteOperationPayload } from './thunks';

export interface NotesState {
  operationStatusesByMealType: Record<MealType, Status>;
}

const initialState: NotesState = {
  operationStatusesByMealType: getInitialOperationStatuses(),
};

function getInitialOperationStatuses(): Record<MealType, Status> {
  return {
    [MealType.Breakfast]: 'idle',
    [MealType.SecondBreakfast]: 'idle',
    [MealType.Lunch]: 'idle',
    [MealType.AfternoonSnack]: 'idle',
    [MealType.Dinner]: 'idle',
  };
}

const operationThunks = [createNote, editNote, deleteNote];

type NoteOperationAsyncThunk = AnyAsyncThunk<NoteOperationPayload>;

type NotePendingOperationAction = ReturnType<NoteOperationAsyncThunk['pending']>;
type NoteFulfilledOperationAction = ReturnType<NoteOperationAsyncThunk['fulfilled']>;
type NoteRejectedOperationAction = ReturnType<NoteOperationAsyncThunk['rejected']>;

type NoteOperationAction =
  | NotePendingOperationAction
  | NoteFulfilledOperationAction
  | NoteRejectedOperationAction;

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addMatcher<NoteOperationAction>(
        createAsyncThunkMatcher(operationThunks, 'pending'),
        (state, action) => {
          state.operationStatusesByMealType[action.meta.arg.mealType] = 'pending';
        },
      )
      .addMatcher<NoteOperationAction>(
        createAsyncThunkMatcher(operationThunks, 'fulfilled'),
        (state, action) => {
          state.operationStatusesByMealType[action.meta.arg.mealType] = 'succeeded';
        },
      )
      .addMatcher<NoteOperationAction>(
        createAsyncThunkMatcher(operationThunks, 'rejected'),
        (state, action) => {
          state.operationStatusesByMealType[action.meta.arg.mealType] = 'failed';
        },
      ),
});

export default notesSlice.reducer;
