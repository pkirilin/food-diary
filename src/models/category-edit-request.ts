import { CategoryCreateEdit } from './category-create-edit';

export interface CategoryEditRequest extends CategoryCreateEdit {
  id: number;
}
