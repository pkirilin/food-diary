import { API_URL } from '../config';
import { ProductCreateEdit, ProductsFilter, ProductEditRequest, ProductDropdownSearchRequest } from '../models';

const productsApiUrl = `${API_URL}/v1/products`;

export const getProductDropdownItemsAsync = async ({
  productNameFilter,
}: ProductDropdownSearchRequest): Promise<Response> => {
  let requestUrl = `${productsApiUrl}/dropdown`;

  if (productNameFilter) {
    requestUrl += `?productNameFilter=${encodeURIComponent(productNameFilter)}`;
  }

  return await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getProductsAsync = async ({
  pageSize,
  pageNumber,
  categoryId,
  productName,
}: ProductsFilter): Promise<Response> => {
  let requestUrl = `${productsApiUrl}?pageSize=${pageSize}`;

  if (pageNumber) {
    requestUrl += `&pageNumber=${pageNumber}`;
  }

  if (categoryId) {
    requestUrl += `&categoryId=${categoryId}`;
  }

  if (productName) {
    requestUrl += `&productSearchName=${productName}`;
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

export const editProductAsync = async ({ id, product }: ProductEditRequest): Promise<Response> => {
  return await fetch(`${productsApiUrl}/${id}`, {
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
