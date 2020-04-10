import { PagesFilter, PageCreateEdit } from '../models';
import { API_URL } from '../config';

const pagesApiClientUrl = `${API_URL}/v1/pages`;

export const getPagesAsync = async ({ sortOrder, showCount }: PagesFilter): Promise<Response> => {
  let requestUrl = `${pagesApiClientUrl}?sortOrder=${sortOrder}`;

  if (showCount !== undefined) {
    requestUrl += `&showCount=${showCount}`;
  }

  return await fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createPageAsync = async (page: PageCreateEdit): Promise<Response> => {
  return await fetch(pagesApiClientUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(page),
  });
};

export const editPageAsync = async (page: PageCreateEdit): Promise<Response> => {
  return await fetch(pagesApiClientUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(page),
  });
};

export const deletePagesAsync = async (pagesIds: number[]): Promise<Response> => {
  return await fetch(`${pagesApiClientUrl}/batch`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pagesIds),
  });
};
