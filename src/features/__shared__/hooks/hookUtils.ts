import { useEffect, useState } from 'react';
import { TextFieldProps } from '@material-ui/core';
import { KeyboardDatePickerProps } from '@material-ui/pickers';
import { AutocompleteBindingProps, InputHook, ValidatorFunction } from './types';

type BindingCreatorFunction<TValue, TBindingProps> = (
  value: TValue,
  setValue: React.Dispatch<React.SetStateAction<TValue>>,
) => TBindingProps;

type ValidatedInputOptions<TValue> = {
  validate: ValidatorFunction<TValue>;
  errorHelperText?: string;
};

type ValidatedInputProps = TextFieldProps | KeyboardDatePickerProps;

export function createInputHook<TValue, TBindingProps>(
  createBinding: BindingCreatorFunction<TValue, TBindingProps>,
): InputHook<TValue, TBindingProps> {
  return initialValue => {
    const [value, setValue] = useState(initialValue);
    return [value, setValue, () => createBinding(value, setValue)];
  };
}

export function createValidatedInputHook<TValue, TBindingProps extends ValidatedInputProps>(
  useInputBase: InputHook<TValue, TBindingProps>,
): InputHook<TValue, TBindingProps, ValidatedInputOptions<TValue>> {
  return (initialValue, { validate, errorHelperText = '' }) => {
    const [value, setValue, bindValue] = useInputBase(initialValue);
    const [error, setError] = useState(false);
    const [helperText, setHelperText] = useState('');

    useEffect(() => {
      const isInputValid = validate(value);
      setError(!isInputValid);
      setHelperText(isInputValid ? '' : errorHelperText);
    }, [value]);

    return [
      value,
      setValue,
      () => ({
        ...bindValue(),
        error,
        helperText,
      }),
    ];
  };
}

export function createAsyncAutocompleteInputHook<TOption>(
  createHook: () => ReturnType<InputHook<TOption | null, AutocompleteBindingProps<TOption>>>,
): InputHook<TOption | null, AutocompleteBindingProps<TOption>> {
  return createHook;
}
