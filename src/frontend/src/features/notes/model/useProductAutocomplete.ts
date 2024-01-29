import { productsApi, type ProductSelectOption } from 'src/features/products';

interface UseProductAutocompleteResult {
  data: ProductSelectOption[];
  isLoading: boolean;
}

const QUERY_ARG = {};

export const useProductAutocomplete = (): UseProductAutocompleteResult => {
  const query = productsApi.useGetProductSelectOptionsQuery(QUERY_ARG, { refetchOnFocus: true });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
  };
};
