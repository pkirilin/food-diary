import { type ValidatorFunction } from '@/shared/types';

export const validateCategoryName: ValidatorFunction<string> = value =>
  value.length >= 3 && value.length <= 50;
