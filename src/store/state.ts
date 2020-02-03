import { PagesState } from './pages-state';
import { NotesState } from './notes-state';
import { MealsState } from './meals-state';

export interface FoodDiaryState {
  pages: PagesState;
  notes: NotesState;
  meals: MealsState;
}
