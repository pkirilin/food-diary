import { type SortOrder } from 'src/types';
import { type Page, type PageCreateEdit } from '../models';

export interface GetPagesRequest {
  startDate: string | null;
  endDate: string | null;
  sortOrder: SortOrder;
  pageNumber: number;
  pageSize: number;
}

export interface PageByIdResponse {
  currentPage: Page;
}

export interface EditPageRequest {
  id: number;
  page: PageCreateEdit;
}

export interface ExportPagesToGoogleDocsRequest {
  startDate: string;
  endDate: string;
}
