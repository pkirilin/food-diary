import { HttpResponse, type JsonBodyType, delay as mswDelay } from 'msw';
import { MOCK_API_RESPONSE_DELAY } from '@/shared/config';

const delay = (): Promise<void> => {
  if (import.meta.env.MODE === 'test') {
    return mswDelay();
  }

  return MOCK_API_RESPONSE_DELAY > 0 ? mswDelay(MOCK_API_RESPONSE_DELAY) : mswDelay();
};

const status = async (code: number): Promise<HttpResponse<null>> => {
  await delay();
  return new HttpResponse(null, { status: code });
};

const ok = (): Promise<HttpResponse<null>> => status(200);

const badRequest = (): Promise<HttpResponse<null>> => status(400);

const notFound = (): Promise<HttpResponse<null>> => status(404);

const validationProblem = async (
  errors: Record<string, string[]>,
): Promise<HttpResponse<JsonBodyType>> => {
  await delay();
  return HttpResponse.json(
    {
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.1',
      title: 'One or more validation errors occurred.',
      status: 400,
      errors,
    },
    { status: 400 },
  );
};

const file = async (blob: Blob): Promise<HttpResponse<Blob>> => {
  await delay();
  return new HttpResponse(blob);
};

const json = async <T extends JsonBodyType>(data: T): Promise<HttpResponse<T>> => {
  await delay();
  return HttpResponse.json(data);
};

export const DelayedHttpResponse = {
  ok,
  badRequest,
  notFound,
  validationProblem,
  json,
  file,
} as const;
