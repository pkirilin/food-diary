import { type ProductSelectOption } from '@/entities/product';

export const shouldSuggestAddingNewProduct = (
  products: ProductSelectOption[],
  query: string,
): boolean => query.trim().length > 0 && products.every(product => product.name !== query);
