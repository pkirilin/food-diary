import { ValidatorFunction } from './hooks/types';

export const dateValidator: ValidatorFunction<Date | null> = date =>
  date !== null && !isNaN(date.getTime());
