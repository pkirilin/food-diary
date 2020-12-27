import { InputHTMLAttributes, useEffect, useState } from 'react';

export interface InputObject<T> {
  value: T;
  isValid: boolean;
  binding: InputParameters;
}

export type InputParameters = Pick<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>;
export type InputValue = InputParameters['value'];
export type InputValidator<T> = (value: T) => boolean;

export default function useInput<T extends InputValue>(initialValue: T, validator?: InputValidator<T>): InputObject<T> {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(validator ? false : true);

  useEffect(() => {
    if (validator) {
      setIsValid(validator(value));
    }
  }, [validator, value]);

  return {
    value,
    isValid,
    binding: {
      value,
      onChange: (event): void => {
        setValue(event.target.value as T);
      },
    },
  };
}
