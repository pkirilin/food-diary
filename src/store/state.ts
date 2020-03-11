import { PagesState } from './pages-state';
import { NotesState } from './notes-state';
import { MealsState } from './meals-state';
import { ProductsState } from './products-state';
import { CategoriesState } from './categories-state';

export interface FoodDiaryState {
  pages: PagesState;
  notes: NotesState;
  meals: MealsState;
  products: ProductsState;
  categories: CategoriesState;
}
