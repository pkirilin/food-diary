import { useDispatch } from 'react-redux';
import { useAsyncAutocompleteInput } from '../__shared__/hooks';
import { createAsyncAutocompleteInputHook } from '../__shared__/hooks';
import { CategoryAutocompleteOption } from './models';
import { autocompleteCleared } from './slice';
import { getCategoriesAutocomplete } from './thunks';

export const useCategoryAutocompleteInput = createAsyncAutocompleteInputHook(() => {
  const dispatch = useDispatch();

  return useAsyncAutocompleteInput<CategoryAutocompleteOption>(
    state => state.categories.autocompleteOptions,
    active => {
      dispatch(getCategoriesAutocomplete(active));
    },
    () => {
      dispatch(autocompleteCleared());
    },
  );
});
