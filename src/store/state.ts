import { PagesState } from './pages-state';
import { NotesState } from './notes-state';

export interface FoodDiaryState {
  pages: PagesState;
  notes: NotesState;
}
