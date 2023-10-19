import { Page } from 'src/features/pages';
import { DbPage } from '../db';

export const mapToPage = ({ id, date }: DbPage): Page => ({
  id,
  date,
});
