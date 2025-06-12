import { type GetNotesByMealsResponse } from '../lib';
import { type MealType } from '../model';

export const nextDisplayOrder = (data: GetNotesByMealsResponse, mealType: MealType): number =>
  data[mealType].reduce((max, note) => (note.displayOrder > max ? note.displayOrder : max), -1) + 1;
