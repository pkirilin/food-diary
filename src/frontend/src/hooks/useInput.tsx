import { useCallback, useEffect, useState } from 'react';
import { type InputOptions, type MapToInputPropsFunction, type ValidatorFunction } from 'src/types';

interface UseInputOptions<TValue, TProps> {
  initialValue: TValue;
  errorHelperText: string;
  validate: ValidatorFunction<TValue>;
  mapToInputProps: MapToInputPropsFunction<TValue, TProps>;
}

type UseInputResult<TValue, TProps> = InputOptions<TValue> & {
  clearValue: () => void;
  isTouched: boolean;
  inputProps: TProps;
};

export default function useInput<TValue, TProps>({
  initialValue,
  errorHelperText,
  validate,
  mapToInputProps,
}: UseInputOptions<TValue, TProps>): UseInputResult<TValue, TProps> {
  const [value, originalSetValue] = useState<TValue>(initialValue);
  const [helperText, setHelperText] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const setValue = useCallback(
    (newValue: TValue) => {
      originalSetValue(newValue);
      setIsTouched(true);
    },
    [originalSetValue, setIsTouched],
  );

  const clearValue = useCallback(() => {
    originalSetValue(initialValue);
    setHelperText('');
    setIsInvalid(false);
    setIsTouched(false);
  }, [initialValue, originalSetValue, setIsTouched]);

  useEffect(() => {
    if (isTouched) {
      const isInvalid = !validate(value);
      const helperText = isInvalid ? errorHelperText : '';
      setIsInvalid(isInvalid);
      setHelperText(helperText);
    }
  }, [errorHelperText, isTouched, validate, value]);

  const inputProps = mapToInputProps({
    value,
    setValue,
    helperText,
    isInvalid,
  });

  return {
    value,
    setValue,
    clearValue,
    helperText,
    isInvalid,
    isTouched,
    inputProps,
  };
}
