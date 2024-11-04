import { type GetNotesResponseAggregated, type NoteItem } from '../api';
import { type MealType } from '../model';

const calculateCalories = (notes: NoteItem[]): number =>
  notes.reduce((sum, note) => sum + note.calories, 0);

export const totalCalories = (data: GetNotesResponseAggregated): number =>
  calculateCalories(Object.values(data).flat());

export const totalCaloriesByMeal = (data: GetNotesResponseAggregated, mealType: MealType): number =>
  calculateCalories(data[mealType]);

export const nextDisplayOrder = (data: GetNotesResponseAggregated, mealType: MealType): number =>
  data[mealType].reduce((max, note) => (note.displayOrder > max ? note.displayOrder : max), -1) + 1;
