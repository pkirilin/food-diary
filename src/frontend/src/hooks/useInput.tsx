import { useCallback, useEffect, useState } from 'react';
import { type InputOptions, type MapToInputPropsFunction, type ValidatorFunction } from 'src/types';

// Single space is used to avoid shifting form control when it becomes invalid
// Source: https://github.com/mui/material-ui/issues/13646
const VALID_HELPER_TEXT = ' ';

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
  const [helperText, setHelperText] = useState(VALID_HELPER_TEXT);
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
    setHelperText(VALID_HELPER_TEXT);
    setIsInvalid(false);
    setIsTouched(false);
  }, [initialValue, originalSetValue, setIsTouched]);

  useEffect(() => {
    if (isTouched) {
      const isInvalid = !validate(value);
      const helperText = isInvalid ? errorHelperText : VALID_HELPER_TEXT;
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
