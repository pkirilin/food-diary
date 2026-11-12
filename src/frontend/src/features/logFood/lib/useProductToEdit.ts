import { productApi, type GetProductByIdResponse } from '@/entities/product';

interface UseProductToEditResult {
  product: GetProductByIdResponse | null;
  productLoadFailed: boolean;
}

// Forms take their default values from the product once, on mount, so they must not mount on a
// cached product that is being refetched or whose refetch failed
export const useProductToEdit = (productId: number): UseProductToEditResult => {
  const { data = null, isFetching, isError } = productApi.useProductByIdQuery(productId);

  return {
    product: isFetching || isError ? null : data,
    productLoadFailed: isError,
  };
};
