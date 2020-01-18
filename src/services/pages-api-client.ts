import { PagesFilter } from '../models';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const loadPages = async (filter: PagesFilter): Promise<Response> => {
  return await fetch('pages-list-data.json');
};
