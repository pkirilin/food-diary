import { useCallback, useMemo, useState } from 'react';
import { EMPTY_FORM_VALUES } from '../model/constants';
import { type FormValues } from '../model/types';

interface Result {
  values: FormValues;
  setValues: (values: FormValues) => void;
  clearValues: () => void;
}

export const useFormValues = (initialValues = EMPTY_FORM_VALUES): Result => {
  const [values, setValues] = useState<FormValues>(initialValues);

  const clearValues = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return useMemo(
    () => ({
      values,
      setValues,
      clearValues,
    }),
    [clearValues, values],
  );
};
