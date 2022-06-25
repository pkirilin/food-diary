import isValid from 'date-fns/isValid';
import { ValidatorFunction } from 'src/types';

export const validateDate: ValidatorFunction<Date | null> = date => {
  if (date === null) {
    return false;
  }

  if (!isValid(date)) {
    return false;
  }

  if (date.getFullYear().toString().length < 4) {
    return false;
  }

  return true;
};
