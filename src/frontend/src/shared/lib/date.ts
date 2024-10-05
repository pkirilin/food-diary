import { format, startOfMonth, endOfMonth } from 'date-fns/fp';

export const enum DateFormat {
  Iso = 'yyyy-MM-dd',
  UserFriendly = 'd MMM yyyy',
}

export const formatToISOStringWithoutTime = format(DateFormat.Iso);
export const formatToUserFriendlyString = format(DateFormat.UserFriendly);
export const getStartOfMonth = startOfMonth();
export const getEndOfMonth = endOfMonth();
export const getCurrentDate = (): Date => new Date();
