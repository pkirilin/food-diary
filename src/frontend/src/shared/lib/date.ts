import format from 'date-fns/format';

export const formatToISOStringWithoutTime = (date: Date): string => format(date, 'yyyy-MM-dd');

export const formatToUserFriendlyString = (date: string): string =>
  format(new Date(date), 'E, d MMM yyyy');
