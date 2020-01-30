import { MealItem } from './meal-item';

export interface NotesForPage {
  pageId: number;
  date: string;
  meals: MealItem[];
}
