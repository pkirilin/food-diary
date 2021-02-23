import { AnyAction, AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit';
import { downloadFile } from './fileHelper';

export type ApiCallAsyncThunk<TData, TArgument> = AsyncThunk<
  TData,
  TArgument,
  Record<string, unknown>
>;
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
    return contentType && contentType !== 'none'
      ? { headers: { 'Content-Type': contentType } }
      : {};
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

export const handleDownloadFile: ApiResponseHandler<void> = async response => {
  const blob = await response.blob();
  // TODO: add details to file name (e.g. date range), fix format
  downloadFile(blob, 'FoodDiary.json');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyAsyncThunk<TArgument = any> = AsyncThunk<any, TArgument, Record<string, unknown>>;

type AnyAsyncThunkActionProperties = keyof Pick<
  AnyAsyncThunk,
  'pending' | 'fulfilled' | 'rejected'
>;

export function createAsyncThunkMatcher<
  TAsyncThunk extends AnyAsyncThunk,
  TAction extends AnyAction = AnyAction
>(thunks: TAsyncThunk[], actionProp: AnyAsyncThunkActionProperties): (action: TAction) => boolean {
  return action => thunks.some(t => t[actionProp].type === action.type);
}
