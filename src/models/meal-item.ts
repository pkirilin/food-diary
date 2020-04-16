import { NoteItem } from './note-item';

export enum MealType {
  Breakfast = 1,
  SecondBreakfast = 2,
  Lunch = 3,
  AfternoonSnack = 4,
  Dinner = 5,
}

export interface MealItem {
  name: string;
  type: MealType;
  notes: NoteItem[];
}

export const availableMealTypes: MealType[] = [
  MealType.Breakfast,
  MealType.SecondBreakfast,
  MealType.Lunch,
  MealType.AfternoonSnack,
  MealType.Dinner,
];
