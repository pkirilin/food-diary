import isValid from 'date-fns/isValid';
import { SelectOption, ValidatorFunction } from 'src/types';

export const validateDate: ValidatorFunction<Date | null> = value => {
  if (value === null) {
    return false;
  }

  if (!isValid(value)) {
    return false;
  }

  if (value.getFullYear().toString().length < 4) {
    return false;
  }

  return true;
};

export const validateCategoryName: ValidatorFunction<string> = value => {
  return value.length >= 3 && value.length <= 50;
};

export const validateProductName: ValidatorFunction<string> = value => {
  return value.length >= 3 && value.length <= 50;
};

export const validateCaloriesCost: ValidatorFunction<number> = value => {
  return value > 0 && value < 5000;
};

export const validateSelectOption: ValidatorFunction<SelectOption | null> = value => {
  return value !== null;
};
