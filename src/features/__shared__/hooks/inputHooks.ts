import { useEffect, useState } from 'react';
import { InputProps } from '@material-ui/core';
import { KeyboardDatePickerProps } from '@material-ui/pickers';
import { RootState } from '../../../store';
import { AutocompleteOption } from '../models';
import { createInputHook } from './hookUtils';
import { AutocompleteBindingProps, InputHook } from './types';
import useTypedSelector from './useTypedSelector';

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

export function useAsyncAutocompleteInput<TOption extends AutocompleteOption>(
  selector: (state: RootState) => TOption[],
  getOptions: (active: boolean) => void,
  clearOptions: () => void,
  initialOption: TOption | null = null,
): ReturnType<InputHook<TOption | null, AutocompleteBindingProps<TOption>>> {
  const [open, setOpen] = useState(false);
  const options = useTypedSelector(selector);
  const loading = open && options.length === 0;

  const useInput = createInputHook<TOption | null, AutocompleteBindingProps<TOption>>(
    (value, setValue) => ({
      options,
      open,
      loading,
      value,
      onChange: (event, selectedOption) => {
        setValue(selectedOption);
      },
      onOpen: () => {
        setOpen(true);
      },
      onClose: () => {
        setOpen(false);
      },
      getOptionSelected: (option, value) => option.name === value.name,
      getOptionLabel: option => option.name,
    }),
  );

  useEffect(() => {
    let active = true;

    if (!loading) {
      return;
    }

    getOptions(active);

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      clearOptions();
    }
  }, [open]);

  return useInput(initialOption);
}
