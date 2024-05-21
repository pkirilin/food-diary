import { api } from '@/shared/api';
import { type UploadFilesResponse } from './contracts';

export const fileApi = api.injectEndpoints({
  endpoints: builder => ({
    uploadFiles: builder.mutation<UploadFilesResponse, FormData>({
      query: body => ({
        url: '/api/files',
        method: 'POST',
        body,
      }),
    }),
  }),
});
