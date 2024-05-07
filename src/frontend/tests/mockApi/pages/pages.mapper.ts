import { formatDate } from '@/shared/lib';
import { type Page } from 'src/features/pages';
import { type DbPage } from '../db';

export const mapToPage = ({ id, date }: DbPage): Page => ({
  id,
  date: formatDate(new Date(date)),
});
