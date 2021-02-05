import { useState } from 'react';
import { AutocompleteCustomBaseProps } from '../types';
import { BindableValueHookResult } from './types';

export type InputAutocompleteBinding<TOption> = AutocompleteCustomBaseProps<TOption>;

export type InputAutocompleteHookResult<TOption> = BindableValueHookResult<
  TOption,
  InputAutocompleteBinding<TOption>
>;

export function useInputAutocomplete<TOption>(
  initialValue: TOption | null,
): InputAutocompleteHookResult<TOption | null> {
  const [value, setValue] = useState<TOption | null>(initialValue);

  return {
    value,
    setValue,
    binding: {
      value,
      onChange: (event, value) => {
        setValue(value);
      },
    },
  };
}
