import { type NoteItem } from '../api';
import { type GetNotesByMealsResponse } from '../lib';
import { type MealType } from '../model';

const calculateCalories = (notes: NoteItem[]): number =>
  notes.reduce((sum, note) => sum + note.calories, 0);

export const totalCalories = (data: GetNotesByMealsResponse): number =>
  calculateCalories(Object.values(data).flat());

export const totalCaloriesByMeal = (data: GetNotesByMealsResponse, mealType: MealType): number =>
  calculateCalories(data[mealType]);

export const nextDisplayOrder = (data: GetNotesByMealsResponse, mealType: MealType): number =>
  data[mealType].reduce((max, note) => (note.displayOrder > max ? note.displayOrder : max), -1) + 1;
