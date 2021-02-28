import { InputProps } from '@material-ui/core';
import { KeyboardDatePickerProps } from '@material-ui/pickers';
import { AutocompleteCustomBaseProps } from '../types';
import { createInputHook } from './hookUtils';
import { InputHook } from './types';

export const useTextInput = createInputHook<string, InputProps>((value, setValue) => ({
  value,
  onChange: event => {
    setValue(event.target.value);
  },
}));

export const useNumericInput = createInputHook<number, InputProps>((value, setValue) => ({
  value,
  onChange: event => {
    setValue(Number(event.target.value));
  },
}));

export const useDateInput = createInputHook<Date | null, KeyboardDatePickerProps>(
  (value, setValue) => ({
    value,
    onChange: newDate => {
      setValue(newDate);
    },
  }),
);

export function useAutocompleteInput<TOption>(): InputHook<
  TOption | null,
  AutocompleteCustomBaseProps<TOption>
> {
  return createInputHook<TOption | null, AutocompleteCustomBaseProps<TOption>>(
    (value, setValue) => ({
      value,
      onChange: (event, selectedOption) => {
        setValue(selectedOption);
      },
    }),
  );
}
