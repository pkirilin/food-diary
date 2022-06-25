import { useState, useEffect } from 'react';

type UseValidatedStateOptions<T> = {
  initialValue: T;
  errorHelperText: string;
  validatorFunction: (value: T) => boolean;
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

  useEffect(() => {
    if (isTouched) {
      const isInvalid = !validatorFunction(value);
      const helperText = isInvalid ? errorHelperText : '';
      setIsInvalid(isInvalid);
      setHelperText(helperText);
    }
  }, [errorHelperText, isTouched, validatorFunction, value]);

  function setValue(newValue: T) {
    originalSetValue(newValue);
    setIsTouched(true);
  }

  return {
    value,
    setValue,
    helperText,
    isInvalid,
    isTouched,
  };
}
