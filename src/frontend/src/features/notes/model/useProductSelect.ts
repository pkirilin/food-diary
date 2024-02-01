import { productsApi, type ProductSelectOption } from 'src/features/products';

interface UseProductSelectResult {
  data: ProductSelectOption[];
  isLoading: boolean;
}

const QUERY_ARG = {};

export const useProductSelect = (): UseProductSelectResult => {
  const query = productsApi.useGetProductSelectOptionsQuery(QUERY_ARG, { refetchOnFocus: true });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
  };
};
