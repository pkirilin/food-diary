import { InputHook, AutocompleteBindingProps } from './types';

export default function createAsyncAutocompleteInputHook<TOption>(
  createHook: () => ReturnType<InputHook<TOption | null, AutocompleteBindingProps<TOption>>>,
): InputHook<TOption | null, AutocompleteBindingProps<TOption>> {
  return createHook;
}
