// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sleep } from './sleep';

export const getCategoryDropdownItemsAsync = async (): Promise<Response> => {
  return await fetch('/categories-dropdown-items-data.json');
};
