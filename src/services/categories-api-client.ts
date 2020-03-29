/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sleep } from './sleep';
import { CategoriesFilter, CategoryCreateEdit } from '../models';

export const getCategoryDropdownItemsAsync = async (): Promise<Response> => {
  return await fetch('/categories-dropdown-items-data.json');
};

export const getCategoriesAsync = async (filter: CategoriesFilter): Promise<Response> => {
  return await fetch('/categories-list-items-data.json');
};

export const createCategoryAsync = async (category: CategoryCreateEdit): Promise<Response> => {
  return await fetch('/');
};

export const editCategoryAsync = async (category: CategoryCreateEdit): Promise<Response> => {
  return await fetch('/');
};

export const deleteCategoryAsync = async (categoryId: number): Promise<Response> => {
  return await fetch('/');
};
