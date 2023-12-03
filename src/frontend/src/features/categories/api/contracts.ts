export interface CreateCategoryRequest {
  name: string;
}

export interface EditCategoryRequest {
  id: number;
  name: string;
}

export type DeleteCategoryRequest = number;
