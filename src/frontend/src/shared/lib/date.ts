import endOfMonth from 'date-fns/endOfMonth';
import format from 'date-fns/format';
import subWeeks from 'date-fns/subWeeks';

export const formatToISOStringWithoutTime = (date: Date): string => format(date, 'yyyy-MM-dd');

export const formatToUserFriendlyString = (date: string): string =>
  format(new Date(date), 'd MMM yyyy');

export const getWeeksBefore = (date: Date, amount: number): Date => subWeeks(date, amount);

export const getEndOfMonth = (date: Date): Date => endOfMonth(date);
