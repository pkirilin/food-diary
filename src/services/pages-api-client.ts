import { PagesFilter } from '../models';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getPagesAsync = async (filter: PagesFilter): Promise<Response> => {
  return await fetch('pages-list-data.json');
};

export const createPageAsync = async (): Promise<Response> => {
  return await fetch('');
};
