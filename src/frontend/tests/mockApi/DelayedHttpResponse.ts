import { HttpResponse, type JsonBodyType, delay as mswDelay } from 'msw';
import { MOCK_API_RESPONSE_DELAY } from '@/config';

const delay = (): Promise<void> => {
  if (import.meta.env.MODE === 'test') {
    return mswDelay();
  }

  return MOCK_API_RESPONSE_DELAY > 0 ? mswDelay(MOCK_API_RESPONSE_DELAY) : mswDelay();
};

const status = async (code: number): Promise<HttpResponse> => {
  await delay();
  return new HttpResponse(null, { status: code });
};

const ok = (): Promise<HttpResponse> => status(200);

const badRequest = (): Promise<HttpResponse> => status(400);

const notFound = (): Promise<HttpResponse> => status(400);

const file = async (blob: Blob): Promise<HttpResponse> => {
  await delay();
  return new HttpResponse(blob);
};

const json = async <T extends JsonBodyType>(data: T): Promise<HttpResponse> => {
  await delay();
  return HttpResponse.json(data);
};

export const DelayedHttpResponse = {
  ok,
  badRequest,
  notFound,
  json,
  file,
} as const;
