import { type ValidatorFunction } from '@/shared/types';

export const validateProductName: ValidatorFunction<string> = value =>
  value.length >= 3 && value.length <= 100;

export const validateCaloriesCost: ValidatorFunction<number> = value => value > 0 && value < 5000;

export const validateDefaultQuantity: ValidatorFunction<number> = value =>
  value > 0 && value < 1000;
