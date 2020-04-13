import { API_URL } from '../config';
import { ProductCreateEdit, ProductsFilter, ProductEditRequest } from '../models';

const productsApiUrl = `${API_URL}/v1/products`;

export const getProductDropdownItemsAsync = async (): Promise<Response> => {
  return await fetch('/products-dropdown-items-data.json');
};

export const getProductsAsync = async ({ pageSize, pageNumber, categoryId }: ProductsFilter): Promise<Response> => {
  let requestUrl = `${productsApiUrl}?pageSize=${pageSize}`;

  if (pageNumber !== undefined) {
    requestUrl += `&pageNumber=${pageNumber}`;
  }

  if (categoryId !== undefined) {
    requestUrl += `&categoryId=${categoryId}`;
  }

  return await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createProductAsync = async (product: ProductCreateEdit): Promise<Response> => {
  return await fetch(productsApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
};

export const editProductAsync = async ({ id: productId, ...product }: ProductEditRequest): Promise<Response> => {
  return await fetch(`${productsApiUrl}/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
};

export const deleteProductAsync = async (productId: number): Promise<Response> => {
  return await fetch(`${productsApiUrl}/${productId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
