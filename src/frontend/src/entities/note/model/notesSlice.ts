import { createSlice } from '@reduxjs/toolkit';
import { type NoteItem, noteApi } from '../api';
import { calculateCalories } from '../lib';
import { MealType } from './types';

interface NotesState {
  byMealType: Record<MealType, NoteItem[]>;
}

const createEmptyNoteGroups = (): Record<MealType, NoteItem[]> => ({
  [MealType.Breakfast]: [],
  [MealType.SecondBreakfast]: [],
  [MealType.Lunch]: [],
  [MealType.AfternoonSnack]: [],
  [MealType.Dinner]: [],
});

const initialState: NotesState = {
  byMealType: createEmptyNoteGroups(),
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  selectors: {
    totalCalories: state => calculateCalories(Object.values(state.byMealType).flat()),
  },
  reducers: {},
  extraReducers: builder => {
    builder.addMatcher(noteApi.endpoints.notes.matchFulfilled, (state, { payload }) => {
      state.byMealType = payload.notes.reduce((groups: Record<MealType, NoteItem[]>, note) => {
        groups[note.mealType].push(note);
        return groups;
      }, createEmptyNoteGroups());
    });
  },
});

export const { reducer, selectors } = notesSlice;
