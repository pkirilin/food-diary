import { type SelectOption, type ValidatorFunction } from '@/shared/types';

export const validateCategoryName: ValidatorFunction<string> = value =>
  value.length >= 3 && value.length <= 50;

export const validateQuantity: ValidatorFunction<number> = value => value > 0 && value < 1000;

export const validateSelectOption = <TOption extends SelectOption>(
  value: TOption | null,
): boolean => value !== null;
