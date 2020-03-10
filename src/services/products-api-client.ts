// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sleep } from './sleep';

export const getProductDropdownItemsAsync = async (): Promise<Response> => {
  return await fetch('/products-dropdown-items-data.json');
};

export const getProductsAsync = async (): Promise<Response> => {
  return await fetch('/products-list-data.json');
};
