import { API_URL } from '../config';
import { CategoryCreateEdit, CategoryDropdownSearchRequest } from '../models';
import { CategoryEditRequest } from '../models';

const categoriesApiUrl = `${API_URL}/v1/categories`;

export const getCategoryDropdownItemsAsync = async ({
  categoryNameFilter,
}: CategoryDropdownSearchRequest): Promise<Response> => {
  let requestUrl = `${categoriesApiUrl}/dropdown`;

  if (categoryNameFilter) {
    requestUrl += `?categoryNameFilter=${categoryNameFilter}`;
  }

  return await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getCategoriesAsync = async (): Promise<Response> => {
  return await fetch(categoriesApiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createCategoryAsync = async (category: CategoryCreateEdit): Promise<Response> => {
  return await fetch(categoriesApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
};

export const editCategoryAsync = async ({ id, category }: CategoryEditRequest): Promise<Response> => {
  return await fetch(`${categoriesApiUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
};

export const deleteCategoryAsync = async (categoryId: number): Promise<Response> => {
  return await fetch(`${categoriesApiUrl}/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
