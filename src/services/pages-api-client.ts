import { API_URL } from '../config';
import { PagesFilter, PageCreateEdit, PageEditRequest } from '../models';

const pagesApiClientUrl = `${API_URL}/v1/pages`;

export const getPagesAsync = async ({ startDate, endDate, sortOrder }: PagesFilter): Promise<Response> => {
  let requestUrl = `${pagesApiClientUrl}?sortOrder=${sortOrder}`;

  if (startDate) {
    requestUrl += `&startDate=${startDate}`;
  }

  if (endDate) {
    requestUrl += `&endDate=${endDate}`;
  }

  return fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const createPageAsync = async (page: PageCreateEdit): Promise<Response> => {
  return fetch(pagesApiClientUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(page),
  });
};

export const editPageAsync = async ({ id, page }: PageEditRequest): Promise<Response> => {
  return fetch(`${pagesApiClientUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(page),
  });
};

export const deletePagesAsync = async (pagesIds: number[]): Promise<Response> => {
  return fetch(`${pagesApiClientUrl}/batch`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pagesIds),
  });
};

export const getDateForNewPageAsync = async (): Promise<Response> => {
  return fetch(`${pagesApiClientUrl}/date`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
