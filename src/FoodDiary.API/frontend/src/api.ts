import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import config from './features/__shared__/config';
import { ExportPagesToGoogleDocsRequest } from './features/pages/models';

const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: config.apiUrl,
  }),
  endpoints: builder => ({
    exportPagesToGoogleDocs: builder.mutation<void, ExportPagesToGoogleDocsRequest>({
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

export const { useExportPagesToGoogleDocsMutation } = api;

export default api;
