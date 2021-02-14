import { AsyncThunk, createSlice } from '@reduxjs/toolkit';
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

const operationThunks: AnyAsyncThunk[] = [createNote, editNote, deleteNote];

type OperationAsyncThunk = AsyncThunk<unknown, NoteOperationPayload, Record<string, unknown>>;

type PendingOperationAction = ReturnType<OperationAsyncThunk['pending']>;
type FulfilledOperationAction = ReturnType<OperationAsyncThunk['fulfilled']>;
type RejectedOperationAction = ReturnType<OperationAsyncThunk['rejected']>;

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
      .addMatcher<PendingOperationAction>(
        createAsyncThunkMatcher(operationThunks, 'pending'),
        (state, action) => {
          state.operationStatusesByMealType[action.meta.arg.mealType] = 'pending';
        },
      )
      .addMatcher<FulfilledOperationAction>(
        createAsyncThunkMatcher(operationThunks, 'fulfilled'),
        (state, action) => {
          state.operationStatusesByMealType[action.meta.arg.mealType] = 'succeeded';
        },
      )
      .addMatcher<RejectedOperationAction>(
        createAsyncThunkMatcher(operationThunks, 'rejected'),
        (state, action) => {
          state.operationStatusesByMealType[action.meta.arg.mealType] = 'failed';
        },
      ),
});

export const {} = notesSlice.actions;

export default notesSlice.reducer;
