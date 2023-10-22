import { Page } from 'src/features/pages';
import { formatDate } from 'src/utils';
import { DbPage } from '../db';

export const mapToPage = ({ id, date }: DbPage): Page => ({
  id,
  date: formatDate(new Date(date)),
});
