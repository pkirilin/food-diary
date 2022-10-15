import { ValidatorFunction } from 'src/types';
import { CategorySelectOption } from '../types';

export const validateCategorySelectOption: ValidatorFunction<CategorySelectOption | null> = value =>
  value !== null;
