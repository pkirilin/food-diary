import { format } from 'date-fns';

export default function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}
