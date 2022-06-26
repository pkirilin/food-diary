import { useState, useEffect, useCallback } from 'react';
import { ValidatorFunction } from 'src/types';

type UseValidatedStateOptions<T> = {
  initialValue: T;
  errorHelperText: string;
  validatorFunction: ValidatorFunction<T>;
};

export default function useValidatedState<T>({
  initialValue,
  errorHelperText,
  validatorFunction,
}: UseValidatedStateOptions<T>) {
  const [value, originalSetValue] = useState<T>(initialValue);
  const [helperText, setHelperText] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const setValue = useCallback(
    (newValue: T) => {
      originalSetValue(newValue);
      setIsTouched(true);
    },
    [originalSetValue, setIsTouched],
  );

  const clearValue = useCallback(() => {
    originalSetValue(initialValue);
    setIsTouched(false);
  }, [initialValue, originalSetValue, setIsTouched]);

  useEffect(() => {
    if (isTouched) {
      const isInvalid = !validatorFunction(value);
      const helperText = isInvalid ? errorHelperText : '';
      setIsInvalid(isInvalid);
      setHelperText(helperText);
    }
  }, [errorHelperText, isTouched, validatorFunction, value]);

  return {
    value,
    setValue,
    clearValue,
    helperText,
    isInvalid,
    isTouched,
  };
}
