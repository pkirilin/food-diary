import { ProductCreateEdit } from './product-create-edit';

export interface ProductEditRequest extends ProductCreateEdit {
  id: number;
}
