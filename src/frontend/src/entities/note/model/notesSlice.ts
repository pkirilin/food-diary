import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import { type NoteItem, noteApi, type GetNotesResponse } from '../api';
import { calculateCalories } from '../lib';
import { MealType } from './types';

interface NotesState {
  byMealType: Record<MealType, NoteItem[]>;
}

const makeNoteGroups = (notes: NoteItem[]): Record<MealType, NoteItem[]> =>
  notes.reduce(
    (groups: Record<MealType, NoteItem[]>, note) => {
      groups[note.mealType].push(note);
      return groups;
    },
    {
      [MealType.Breakfast]: [],
      [MealType.SecondBreakfast]: [],
      [MealType.Lunch]: [],
      [MealType.AfternoonSnack]: [],
      [MealType.Dinner]: [],
    },
  );

const initialState: NotesState = {
  byMealType: makeNoteGroups([]),
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  selectors: {
    totalCalories: state => calculateCalories(Object.values(state.byMealType).flat()),
    totalCaloriesByMeal: (state, mealType: MealType) =>
      calculateCalories(state.byMealType[mealType]),
  },
  reducers: {
    notesLoaded: (state, { payload }: PayloadAction<GetNotesResponse>) => {
      state.byMealType = makeNoteGroups(payload.notes);
    },
  },
  extraReducers: builder => {
    builder.addMatcher(noteApi.endpoints.notes.matchFulfilled, (state, { payload }) => {
      state.byMealType = makeNoteGroups(payload.notes);
    });
  },
});

export const { reducer, selectors, actions } = notesSlice;
