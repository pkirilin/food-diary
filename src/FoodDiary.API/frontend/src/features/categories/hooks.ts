import { useDispatch } from 'react-redux';
import { useAsyncAutocompleteInput } from '../__shared__/hooks';
import { createAsyncAutocompleteInputHook } from '../__shared__/hooks';
import { CategoryAutocompleteOption } from './models';
import { getCategoriesAutocomplete } from './thunks';

export const useCategoryAutocompleteInput = createAsyncAutocompleteInputHook(() => {
  const dispatch = useDispatch();

  return useAsyncAutocompleteInput<CategoryAutocompleteOption>(
    state => state.categories.autocompleteOptions,
    () => {
      dispatch(getCategoriesAutocomplete());
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {},
  );
});
