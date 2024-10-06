import { addDays, differenceInDays, subMonths } from 'date-fns';
import { format, endOfMonth } from 'date-fns/fp';

export const enum DateFormat {
  Iso = 'yyyy-MM-dd',
  UserFriendly = 'd MMM yyyy',
}

export const formatToISOStringWithoutTime = format(DateFormat.Iso);
export const formatToUserFriendlyString = format(DateFormat.UserFriendly);
export const getEndOfMonth = endOfMonth();

export const getCurrentDate = (): Date => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export { addDays, differenceInDays, subMonths };
