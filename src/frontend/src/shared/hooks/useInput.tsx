import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type InputOptions,
  type MapToInputPropsFunction,
  type ValidatorFunction,
} from '@/shared/types';

// Single space is used to avoid shifting form control when it becomes invalid
// Source: https://github.com/mui/material-ui/issues/13646
const VALID_HELPER_TEXT = ' ';

interface UseInputOptions<TValue, TProps> {
  initialValue: TValue;
  errorHelperText: string;
  validate: ValidatorFunction<TValue>;
  mapToInputProps: MapToInputPropsFunction<TValue, TProps>;
  touched?: boolean;
}

export type UseInputResult<TValue, TProps> = InputOptions<TValue> & {
  clearValue: () => void;
  isTouched: boolean;
  inputProps: TProps;
};

export function useInput<TValue, TProps>({
  initialValue,
  errorHelperText,
  validate,
  mapToInputProps,
  touched = false,
}: UseInputOptions<TValue, TProps>): UseInputResult<TValue, TProps> {
  const [value, originalSetValue] = useState<TValue>(initialValue);
  const [helperText, setHelperText] = useState(VALID_HELPER_TEXT);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isTouched, setIsTouched] = useState(touched);

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

  const forceValidate = useCallback(() => {
    setIsTouched(true);
    setIsInvalid(!validate(value));
  }, [validate, value]);

  useEffect(() => {
    if (isTouched) {
      const isInvalid = !validate(value);
      const helperText = isInvalid ? errorHelperText : VALID_HELPER_TEXT;
      setIsInvalid(isInvalid);
      setHelperText(helperText);
    }
  }, [errorHelperText, isTouched, validate, value]);

  return useMemo(
    () => ({
      value,
      setValue,
      clearValue,
      forceValidate,
      helperText,
      isInvalid,
      isTouched,
      inputProps: mapToInputProps({
        value,
        setValue,
        helperText,
        isInvalid,
        forceValidate,
      }),
    }),
    [clearValue, forceValidate, helperText, isInvalid, isTouched, mapToInputProps, setValue, value],
  );
}
