import { SelectOption, ValidatorFunction } from 'src/types';

export const validateProductSelectOption: ValidatorFunction<SelectOption | null> = value =>
  value !== null;
