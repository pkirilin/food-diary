import { addDays, differenceInDays, subMonths, type Locale } from 'date-fns';
import { format, endOfMonth } from 'date-fns/fp';
import { enUS } from 'date-fns/locale';

export const enum DateFormat {
  Iso = 'yyyy-MM-dd',
  UserFriendly = 'E, d MMM yyyy',
}

export const formatToISOStringWithoutTime = format(DateFormat.Iso);
export const formatToUserFriendlyString = format(DateFormat.UserFriendly);
export const getEndOfMonth = endOfMonth();

export const mondayStartLocale: Locale = { ...enUS, options: { ...enUS.options, weekStartsOn: 1 } };

export const getCurrentDate = (): Date => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export { addDays, differenceInDays, subMonths };
