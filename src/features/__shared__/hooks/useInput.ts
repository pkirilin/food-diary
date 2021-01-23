import { InputHTMLAttributes, useEffect, useRef, useState } from 'react';
import { BindableObject } from './types';

export type InputBinding = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'onChangeCapture'
>;

export type BindableInputValue = InputBinding['value'];

export interface InputHookResult<TValue> extends BindableObject<TValue, InputBinding> {
  isValid: boolean;
  validationMessage?: string;
}

export interface InputValidationResult {
  isValid: boolean;
  message?: string;
}

export type InputValidator<TValue> = (value: TValue) => InputValidationResult;

export type InputHookDebounceAction<TValue> = (currentValue: TValue) => void | Promise<void>;

export interface InputHookDebounce<TValue> {
  delay: number;
  action: InputHookDebounceAction<TValue>;
}

export interface InputHookOptions<TValue> {
  validator?: InputValidator<TValue>;
  debounce?: InputHookDebounce<TValue>;
}

function convertToBindableValue(value: unknown): BindableInputValue {
  switch (typeof value) {
    case 'string':
      return value;
    case 'number':
      return value.toString();
    default:
      throw new Error(
        `Convertation to bindable value from type '${typeof value}' is not supported`,
      );
  }
}

// This function is used to get generic input type's value from input change event
// It fixes an error when value converted as `(event.target.value as unknown) as TValue` was of incorrect type
// TODOs:
// - add `useInput` hook's value parameter constraints (e.g. string | number | Date) to avoid the input of incorrect parameter types
// - remove throwing errors in convert* functions
// - remove unknown types where possible
function convertFromChangeEvent(
  event: React.ChangeEvent<HTMLInputElement>,
  value: unknown,
): unknown {
  const targetValue = event.target.value;
  switch (typeof value) {
    case 'string':
      return targetValue;
    case 'number':
      return Number(targetValue);
    default:
      throw new Error(`Convertation from change event to type '${typeof value}' is not supported`);
  }
}

export function useInput<TValue>(
  initialValue: TValue,
  { validator, debounce }: InputHookOptions<TValue> = {},
): InputHookResult<TValue> {
  const [value, setValue] = useState<TValue>(initialValue);
  const [isValid, setIsValid] = useState(validator ? false : true);
  const [validationMessage, setValidationMessage] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout>();

  const clearDebounceTimer = (): void => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  const onChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const currentValue = convertFromChangeEvent(event, value) as TValue;
    setValue(currentValue);

    if (!debounce) {
      return;
    }

    const { delay, action } = debounce;

    debounceTimer.current = setTimeout(() => {
      action(currentValue);
    }, delay);
  };

  const onChangeCapture: React.FormEventHandler<HTMLInputElement> | undefined = debounce
    ? (): void => {
        clearDebounceTimer();
      }
    : undefined;

  useEffect(() => {
    if (validator) {
      const { isValid, message } = validator(value);
      setIsValid(isValid);
      setValidationMessage(message ?? '');
    }
  }, [validator, value]);

  useEffect(() => {
    return (): void => {
      clearDebounceTimer();
    };
  }, []);

  return {
    value,
    setValue,
    isValid,
    validationMessage,
    binding: {
      value: convertToBindableValue(value),
      onChange,
      onChangeCapture,
    },
  };
}
