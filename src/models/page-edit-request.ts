import { PageCreateEdit } from './page-create-edit';

export interface PageEditRequest extends PageCreateEdit {
  id: number;
}
