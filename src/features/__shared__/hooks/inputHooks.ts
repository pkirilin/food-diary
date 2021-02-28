import { InputProps } from '@material-ui/core';
import { KeyboardDatePickerProps } from '@material-ui/pickers';
import { createInputHook } from './hookUtils';

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
