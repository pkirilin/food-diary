/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PagesFilter, PageCreateEdit } from '../models';
import { sleep } from './sleep';

export const getPagesAsync = async (filter: PagesFilter): Promise<Response> => {
  return await fetch('/pages-list-data.json');
};

export const createPageAsync = async (page: PageCreateEdit): Promise<Response> => {
  return await fetch('');
};

export const editPageAsync = async (page: PageCreateEdit): Promise<Response> => {
  return await fetch('');
};

export const deletePagesAsync = async (pagesIds: number[]): Promise<Response> => {
  return await fetch('');
};
