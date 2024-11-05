import { z } from 'zod';
import { type NoteItem } from '../api';
import { MealType } from '../model';

export type GetNotesByMealsResponse = Record<MealType, NoteItem[]>;

export const createEmptyGetNotesByMealsResponse = (): GetNotesByMealsResponse => ({
  [MealType.Breakfast]: [],
  [MealType.SecondBreakfast]: [],
  [MealType.Lunch]: [],
  [MealType.AfternoonSnack]: [],
  [MealType.Dinner]: [],
});

const MEAL_NAMES: Record<MealType, string> = {
  [MealType.Breakfast]: 'Breakfast',
  [MealType.SecondBreakfast]: 'Second breakfast',
  [MealType.Lunch]: 'Lunch',
  [MealType.AfternoonSnack]: 'Afternoon snack',
  [MealType.Dinner]: 'Dinner',
};

const mealTypeSchema = z.nativeEnum(MealType);

export const getMealTypes = (): MealType[] =>
  Object.keys(MEAL_NAMES).map(key => mealTypeSchema.parse(Number(key)));

export const getMealName = (mealType: MealType): string => MEAL_NAMES[mealType];
