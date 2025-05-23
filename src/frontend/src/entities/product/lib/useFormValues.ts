import { useCallback, useMemo, useState } from 'react';
import { type ProductFormValues } from '../model';
import { EMPTY_FORM_VALUES } from '../model/constants';

interface Result {
  values: ProductFormValues;
  setValues: (values: ProductFormValues) => void;
  clearValues: () => void;
}

export const useFormValues = (initialValues = EMPTY_FORM_VALUES): Result => {
  const [values, setValues] = useState<ProductFormValues>(initialValues);

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
