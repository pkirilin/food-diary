import { ValidatorFunction } from './hooks/types';

export const createDateValidator = (isRequired: boolean): ValidatorFunction<Date | null> => {
  return date =>
    isRequired
      ? date !== null && !isNaN(date.getTime())
      : date === null || (date !== null && !isNaN(date.getTime()));
};
