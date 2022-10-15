import { SelectOption, ValidatorFunction } from 'src/types';

export const validateCategorySelectOption: ValidatorFunction<SelectOption | null> = value =>
  value !== null;
