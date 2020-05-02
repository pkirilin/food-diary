import { PagesState } from './pages-state';
import { NotesState } from './notes-state';
import { MealsState } from './meals-state';
import { ProductsState } from './products-state';
import { CategoriesState } from './categories-state';

export interface RootState {
  pages: PagesState;
  notes: NotesState;
  meals: MealsState;
  products: ProductsState;
  categories: CategoriesState;
}
