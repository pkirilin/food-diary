import categoriesApi from './categoriesApi';

export const {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useEditCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;

export default categoriesApi;
