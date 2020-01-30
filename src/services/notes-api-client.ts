/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { sleep } from './sleep';

export const getNotesForPageAsync = async (pageId: number): Promise<Response> => {
  return await fetch('/notes-for-page-data.json');
};
