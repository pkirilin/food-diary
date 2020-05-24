import { API_URL } from '../config';
import { PagesExportRequest } from '../models';

const exportsApiUrl = `${API_URL}/v1/exports`;

export const exportPagesAsync = async ({ startDate, endDate, format }: PagesExportRequest): Promise<Response> => {
  return await fetch(`${exportsApiUrl}/${format}?startDate=${startDate}&endDate=${endDate}`, {
    method: 'GET',
  });
};
