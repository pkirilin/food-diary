import { type ProductSelectOption } from '@/entities/product';

const QUERY_LENGTH_THRESHOLD = 3;

export const searchProductsByName = (
  sourceProducts: ProductSelectOption[],
  query: string,
): ProductSelectOption[] => {
  const queryTrimmed = query.trim();

  if (queryTrimmed.length < QUERY_LENGTH_THRESHOLD) {
    return [];
  }

  return sourceProducts.filter(product =>
    product.name.trim().toLowerCase().includes(queryTrimmed.toLowerCase()),
  );
};