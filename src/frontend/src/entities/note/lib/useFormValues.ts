import { useMemo } from 'react';
import { type FormValues } from '../model';

interface Result {
  values: FormValues;
}

export const useFormValues = ({ pageId, mealType, displayOrder, quantity }: FormValues): Result => {
  return useMemo<Result>(
    () => ({
      values: {
        pageId,
        mealType,
        displayOrder,
        quantity,
      },
    }),
    [displayOrder, mealType, pageId, quantity],
  );
};
