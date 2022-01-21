import { useState, useEffect } from 'react';
import {
  ValidatedInputProps,
  InputHook,
  InputOptions,
  ValidatedInputHook,
  ValidatedInputOptions,
} from './types';

export default function createValidatedInputHook<TValue, TBindingProps extends ValidatedInputProps>(
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
