import { useEffect, useState } from 'react';
import { TextFieldProps } from '@material-ui/core';
import { KeyboardDatePickerProps } from '@material-ui/pickers';
import {
  AutocompleteBindingProps,
  InputHook,
  ValidatedInputHook,
  ValidatorFunction,
} from './types';

type BindingCreatorFunction<TValue, TBindingProps> = (
  value: TValue,
  setValue: React.Dispatch<React.SetStateAction<TValue>>,
) => TBindingProps;

interface InputOptions<TValue> {
  afterChange?: (value: TValue) => void;
}

interface ValidatedInputOptions<TValue> extends InputOptions<TValue> {
  validate: ValidatorFunction<TValue>;
  errorHelperText?: string;
}

type ValidatedInputProps = TextFieldProps | KeyboardDatePickerProps;

export function createInputHook<TValue, TBindingProps>(
  createBinding: BindingCreatorFunction<TValue, TBindingProps>,
): InputHook<TValue, TBindingProps, InputOptions<TValue>> {
  return (initialValue, options = {}) => {
    const [value, setValue] = useState(initialValue);
    const [isInitialized, setIsInitialized] = useState(false);
    const { afterChange } = options;

    useEffect(() => {
      setIsInitialized(true);
    }, []);

    useEffect(() => {
      if (isInitialized && afterChange) {
        afterChange(value);
      }
    }, [value]);

    return [value, setValue, () => createBinding(value, setValue)];
  };
}

export function createValidatedInputHook<TValue, TBindingProps extends ValidatedInputProps>(
  useInputBase: InputHook<TValue, TBindingProps, InputOptions<TValue>>,
): ValidatedInputHook<TValue, TBindingProps, ValidatedInputOptions<TValue>> {
  return (
    initialValue,
    options = {
      validate: () => true,
    },
  ) => {
    const [value, setValue, bindValue] = useInputBase(initialValue, options);
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [helperText, setHelperText] = useState('');

    const { validate, errorHelperText = '' } = options;

    useEffect(() => {
      setIsInitialized(true);
    }, []);

    useEffect(() => {
      const isInputValid = validate(value);
      setIsValid(isInputValid);

      if (isInitialized) {
        setError(!isInputValid);
        setHelperText(isInputValid ? '' : errorHelperText);
      }
    }, [value]);

    return [
      value,
      setValue,
      () => ({
        ...bindValue(),
        error,
        helperText,
      }),
      isValid,
    ];
  };
}

export function createAsyncAutocompleteInputHook<TOption>(
  createHook: () => ReturnType<InputHook<TOption | null, AutocompleteBindingProps<TOption>>>,
): InputHook<TOption | null, AutocompleteBindingProps<TOption>> {
  return createHook;
}
