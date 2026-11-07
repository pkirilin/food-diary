import { productApi, type GetProductByIdResponse } from '@/entities/product';

interface FreshProduct {
  product: GetProductByIdResponse | undefined;
  loadFailed: boolean;
}

// Forms take their default values from the product once, on mount, so they must not mount on a
// cached product that is being refetched or whose refetch failed
export const useFreshProduct = (productId: number): FreshProduct => {
  const { data, isFetching, isError } = productApi.useProductByIdQuery(productId);

  return {
    product: isFetching || isError ? undefined : data,
    loadFailed: isError,
  };
};
