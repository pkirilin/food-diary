import { format, endOfMonth } from 'date-fns/fp';

export const formatToISOStringWithoutTime = format('yyyy-MM-dd');
export const formatToUserFriendlyString = format('d MMM yyyy');
export const getEndOfMonth = endOfMonth();
