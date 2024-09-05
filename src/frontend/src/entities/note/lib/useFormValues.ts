import { useCallback, useEffect, useMemo, useState } from 'react';
import { type FormValues } from '../model';

interface Result {
  values: FormValues;
  setValues: (values: FormValues) => void;
  clearValues: () => void;
}

export const useFormValues = (initialValues: FormValues): Result => {
  const [values, setValues] = useState<FormValues>(initialValues);

  // Used to catch latest date updates from react-router-dom loader data
  useEffect(() => {
    setValues(prev => ({
      ...prev,
      date: initialValues.date,
    }));
  }, [initialValues.date]);

  const clearValues = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return useMemo<Result>(
    () => ({
      values,
      setValues,
      clearValues,
    }),
    [clearValues, values],
  );
};
