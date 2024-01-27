import { api } from 'src/api';
import { createUrl } from 'src/utils';
import { type PageCreateEdit, type PagesSearchResult } from '../models';
import {
  type GetPagesRequest,
  type ExportPagesToGoogleDocsRequest,
  type PageByIdResponse,
  type EditPageRequest,
} from './contracts';

export const pagesApi = api.injectEndpoints({
  endpoints: builder => ({
    getPages: builder.query<PagesSearchResult, GetPagesRequest>({
      query: request => createUrl('/api/v1/pages', { ...request }),
      providesTags: ['page'],
    }),

    getPageById: builder.query<PageByIdResponse, number>({
      query: id => `/api/v1/pages/${id}`,
      providesTags: ['page'],
    }),

    getDateForNewPage: builder.query<string, void>({
      query: () => '/api/v1/pages/date',
      providesTags: ['page'],
    }),

    createPage: builder.mutation<number, PageCreateEdit>({
      query: page => ({
        method: 'POST',
        url: '/api/v1/pages',
        body: page,
      }),
      invalidatesTags: ['page'],
    }),

    editPage: builder.mutation<void, EditPageRequest>({
      query: ({ id, page }) => ({
        method: 'PUT',
        url: `/api/v1/pages/${id}`,
        body: page,
      }),
      invalidatesTags: ['page'],
    }),

    deletePages: builder.mutation<void, number[]>({
      query: ids => ({
        method: 'DELETE',
        url: `/api/v1/pages/batch`,
        body: ids,
      }),
      invalidatesTags: ['page', 'note'],
    }),

    importFromJson: builder.mutation<void, File>({
      query: file => {
        const formData = new FormData();
        formData.append('importFile', file, file.name);
        return {
          url: '/api/v1/imports/json',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['page', 'note', 'product', 'category'],
    }),

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
