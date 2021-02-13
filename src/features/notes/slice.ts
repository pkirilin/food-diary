import { AnyAction, createSlice } from '@reduxjs/toolkit';
import { Status } from '../__shared__/models';
import { AnyAsyncThunk, createAsyncThunkMatcher } from '../__shared__/utils';
import { Meals, MealType, NoteItem } from './models';
import { createNote, deleteNote, editNote, getNotes } from './thunks';

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

// TODO: remove this hack, make strict types for matchers
function getMealTypeFromActionOrAssert(action: AnyAction): MealType {
  const mealType = action?.meta?.arg?.mealType;

  if (typeof mealType === undefined) {
    const message = `Received action does not contain meal type inside meta argument. Action type is ${action.type}`;
    console.error(message);
    console.error('Action:', action);
    throw Error(message);
  }

  return mealType;
}

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
      .addMatcher(createAsyncThunkMatcher(operationThunks, 'pending'), (state, action) => {
        const mealType = getMealTypeFromActionOrAssert(action);
        state.operationStatusesByMealType[mealType] = 'pending';
      })
      .addMatcher(createAsyncThunkMatcher(operationThunks, 'fulfilled'), (state, action) => {
        const mealType = getMealTypeFromActionOrAssert(action);
        state.operationStatusesByMealType[mealType] = 'succeeded';
      })
      .addMatcher(createAsyncThunkMatcher(operationThunks, 'rejected'), (state, action) => {
        const mealType = getMealTypeFromActionOrAssert(action);
        state.operationStatusesByMealType[mealType] = 'failed';
      }),
});

export const {} = notesSlice.actions;

export default notesSlice.reducer;
