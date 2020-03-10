/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sleep } from './sleep';
import { ProductCreateEdit } from '../models';

export const getProductDropdownItemsAsync = async (): Promise<Response> => {
  return await fetch('/products-dropdown-items-data.json');
};

export const getProductsAsync = async (): Promise<Response> => {
  return await fetch('/products-list-data.json');
};

export const createProductAsync = async (product: ProductCreateEdit): Promise<Response> => {
  return await fetch('');
};

export const editProductAsync = async (product: ProductCreateEdit): Promise<Response> => {
  return await fetch('');
};

export const deleteProductAsync = async (productId: number): Promise<Response> => {
  return await fetch('');
};
