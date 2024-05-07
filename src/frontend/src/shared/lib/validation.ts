import isValid from 'date-fns/isValid';
import { type SelectOption, type ValidatorFunction } from 'src/types';

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

export const validateCategoryName: ValidatorFunction<string> = value =>
  value.length >= 3 && value.length <= 50;

export const validateProductName: ValidatorFunction<string> = value =>
  value.length >= 3 && value.length <= 100;

export const validateCaloriesCost: ValidatorFunction<number> = value => value > 0 && value < 5000;

export const validateQuantity: ValidatorFunction<number> = value => value > 0 && value < 1000;

export const validateSelectOption = <TOption extends SelectOption>(
  value: TOption | null,
): boolean => value !== null;
