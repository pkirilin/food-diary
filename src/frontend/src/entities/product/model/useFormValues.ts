import { useCallback, useState } from 'react';
import { EMPTY_FORM_VALUES } from './constants';
import { type FormValues } from './types';

interface Result {
  values: FormValues;
  setValues: (values: FormValues) => void;
  clearValues: () => void;
}

export const useFormValues = (): Result => {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM_VALUES);

  const clearValues = useCallback(() => {
    setValues(EMPTY_FORM_VALUES);
  }, []);

  return {
    values,
    setValues,
    clearValues,
  };
};
