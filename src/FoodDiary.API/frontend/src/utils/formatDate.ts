import format from 'date-fns/format';

export default function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}
