import { useMemo, useState } from 'react';
import { type FormValues } from '../model';

interface Result {
  values: FormValues;
  setValues: (values: FormValues) => void;
}

export const useFormValues = (initialValues: FormValues): Result => {
  const [values, setValues] = useState<FormValues>(initialValues);

  return useMemo<Result>(
    () => ({
      values,
      setValues,
    }),
    [values],
  );
};
