import { ValidatorFunction } from 'src/types';
import { ProductSelectOption } from '../types';

export const validateProductSelectOption: ValidatorFunction<ProductSelectOption | null> = value =>
  value !== null;
