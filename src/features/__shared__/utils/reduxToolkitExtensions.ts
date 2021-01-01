import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit';

export type ApiCallAsyncThunk<TData, TArgument> = AsyncThunk<TData, TArgument, Record<string, unknown>>;
export type ApiResponseHandler<TData> = (response: Response) => Promise<TData>;
export type ApiCallBodyCreator<TArgument> = (arg: TArgument) => RequestBodyFragment['body'];

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiContentType = 'none' | 'application/json';
type RequestHeadersFragment = Pick<RequestInit, 'headers'>;
type RequestBodyFragment = Pick<RequestInit, 'body'>;

export interface ApiCallOptions<TArgument> {
  method?: ApiMethod;
  contentType?: ApiContentType;
  bodyCreator?: ApiCallBodyCreator<TArgument>;
}

export function createApiCallAsyncThunk<TData, TArgument>(
  typePrefix: string,
  getUrl: (arg: TArgument) => string,
  getData: ApiResponseHandler<TData>,
  defaultErrorMessage = 'Failed to fetch',
  options: ApiCallOptions<TArgument> = {
    method: 'GET',
    contentType: 'application/json',
  },
): ApiCallAsyncThunk<TData, TArgument> {
  const { method = 'GET', contentType = 'application/json', bodyCreator } = options;

  function getHeaders(): RequestHeadersFragment {
    return contentType && contentType !== 'none' ? { headers: { 'Content-Type': contentType } } : {};
  }

  function getBody(arg: TArgument): RequestBodyFragment {
    return bodyCreator ? { body: bodyCreator(arg) } : {};
  }

  return createAsyncThunk<TData, TArgument>(typePrefix, async (arg, { rejectWithValue }) => {
    try {
      const response = await fetch(getUrl(arg), {
        method,
        ...getHeaders(),
        ...getBody(arg),
      });

      if (response.ok) {
        return getData(response);
      }

      return rejectWithValue(`${defaultErrorMessage}: response was not ok`);
    } catch (error) {
      return rejectWithValue(defaultErrorMessage);
    }
  });
}

export const handleEmptyResponse: ApiResponseHandler<void> = async () => {
  return;
};
