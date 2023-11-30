import { api } from 'src/api';
import { type ExportPagesToGoogleDocsRequest } from './contracts';

export const pagesApi = api.injectEndpoints({
  endpoints: builder => ({
    exportToGoogleDocs: builder.mutation<void, ExportPagesToGoogleDocsRequest>({
      query: payload => ({
        url: '/api/v1/exports/google-docs',
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
  }),
});
