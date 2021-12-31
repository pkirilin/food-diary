import { createSlice } from '@reduxjs/toolkit';
import { Status } from '../__shared__/models';
import { AnyAsyncThunk, createAsyncThunkMatcher } from '../__shared__/utils';
import { Meals, MealType, NoteItem } from './models';
import { createNote, deleteNote, editNote, getNotes, NoteOperationPayload } from './thunks';

export type NotesState = {
  noteItems: NoteItem[];
  operationStatusesByMealType: Record<MealType, Status>;
};

const initialState: NotesState = {
  noteItems: [],
  operationStatusesByMealType: getInitialOperationStatuses(),
};

function getInitialOperationStatuses(): Record<MealType, Status> {
  return Meals.get().reduce((statuses, mealType) => {
    statuses[mealType] = 'idle';
    return statuses;
  }, {} as Record<MealType, Status>);
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
      .addCase(getNotes.fulfilled, (state, { payload, meta }) => {
        const isRequestForAllMeals = meta.arg.mealType === undefined;

        state.noteItems = isRequestForAllMeals
          ? payload
          : [...state.noteItems.filter(n => n.mealType !== meta.arg.mealType), ...payload];
      })
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

export const {} = notesSlice.actions;

export default notesSlice.reducer;
