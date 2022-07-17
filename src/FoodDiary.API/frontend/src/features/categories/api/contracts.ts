export type CreateCategoryRequest = {
  name: string;
};

export type EditCategoryRequest = {
  id: number;
  name: string;
};

export type DeleteCategoryRequest = {
  id: number;
};
