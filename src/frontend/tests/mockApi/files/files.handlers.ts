import { http, type HttpHandler } from 'msw';
import { type UploadFilesResponse } from '@/entities/file';
import { API_URL } from '@/shared/config';
import { DelayedHttpResponse } from '../DelayedHttpResponse';

const UPLOAD_FILE_FAKE_RESPONSE: UploadFilesResponse = {
  files: [
    {
      url: 'https://storage.yandexcloud.net/food-diary-images/oranges.png',
    },
  ],
};

export const handlers: HttpHandler[] = [
  http.post(`${API_URL}/api/files`, async ({ request }) => {
    const body = await request.formData();
    const photos = body.getAll('photos');

    if (photos.length < 1) {
      return await DelayedHttpResponse.badRequest();
    }

    return await DelayedHttpResponse.json(UPLOAD_FILE_FAKE_RESPONSE);
  }),
];
