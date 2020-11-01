import { Action, ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';

export interface RequestAction<A, P = {}> extends Action<A> {
  requestMessage: string;
  payload: P;
}

export interface SuccessAction<A, D = {}> extends Action<A> {
  data: D;
}

export interface ErrorAction<A> extends Action<A> {
  errorMessage: string;
}

export type AsyncActionApiCall = {
  setUrl(url: string): AsyncActionApiCall;
};

export type ActionCreatorComposer<A, T> = (data?: T) => A;

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ApiRequestBody = string | FormData | null;
export type ApiResponseHandler<A extends Action, R> = (response: Response, dispatch: Dispatch<A>) => R | Promise<R>;
export type ApiRequestUrlModifier<P> = (baseUrl: string, payload: P) => string;
export type ApiRequestBodyConstructor<P> = (payload: P) => ApiRequestBody;

export interface ApiOptions<SA extends Action, EA extends Action, D, P> {
  baseUrl: string;
  method?: ApiMethod;
  contentType?: string;
  onSuccess?: ApiResponseHandler<SA, D>;
  onError?: ApiResponseHandler<EA, string>;
  modifyUrl?: ApiRequestUrlModifier<P>;
  constructBody?: ApiRequestBodyConstructor<P>;
}

export interface AsyncActionBuilderOptions<RA extends Action, SA extends Action, EA extends Action, D, P> {
  makeRequest(): ActionCreatorComposer<RA, P>;
  makeSuccess(): ActionCreatorComposer<SA, D>;
  makeError(): ActionCreatorComposer<EA, string>;
  apiOptions: ApiOptions<SA, EA, D, P>;
}

type RequestHeadersFragment = Pick<RequestInit, 'headers'>;
type RequestBodyFragment = Pick<RequestInit, 'body'>;

export function createAsyncAction<
  RA extends RequestAction<RC, P>,
  SA extends SuccessAction<SC, D>,
  EA extends ErrorAction<EC>,
  RC extends string,
  SC extends string,
  EC extends string,
  D = {},
  P = {}
>({
  makeRequest,
  makeSuccess,
  makeError,
  apiOptions,
}: AsyncActionBuilderOptions<RA, SA, EA, D, P>): ActionCreator<ThunkAction<Promise<SA | EA>, D, P, SA | EA>> {
  function getRequestUrl(baseUrl: string, payload: P, modifyUrl?: ApiRequestUrlModifier<P>): string {
    if (modifyUrl) {
      return modifyUrl(baseUrl, payload);
    }

    return baseUrl;
  }

  function getHeadersFragment(contentType?: string): RequestHeadersFragment {
    const headersFragment: RequestHeadersFragment = {};

    if (!contentType) {
      headersFragment['headers'] = {
        'Content-Type': 'application/json',
      };
    } else {
      headersFragment['headers'] = {
        'Content-Type': contentType,
      };
    }

    return headersFragment;
  }

  function getBodyFragment(payload: P, constructBody?: ApiRequestBodyConstructor<P>): RequestBodyFragment {
    if (constructBody) {
      return { body: constructBody(payload) };
    }

    return {};
  }

  const request = makeRequest();
  const success = makeSuccess();
  const error = makeError();

  const {
    baseUrl,
    method = 'GET',
    contentType = 'application/json',
    modifyUrl,
    constructBody,
    onSuccess,
    onError,
  } = apiOptions;

  return (payload: P) => {
    return async (dispatch: Dispatch<RA | SA | EA>): Promise<SA | EA> => {
      dispatch(request(payload));

      const requestUrl = getRequestUrl(baseUrl, payload, modifyUrl);

      try {
        const response = await fetch(requestUrl, {
          method,
          ...getHeadersFragment(contentType),
          ...getBodyFragment(payload, constructBody),
        });

        if (response.ok) {
          if (onSuccess) {
            const data = await onSuccess(response, dispatch);
            return dispatch(success(data));
          }
          return dispatch(success());
        }

        if (onError) {
          const errorMessage = await onError(response, dispatch);
          return dispatch(error(errorMessage));
        }

        return dispatch(error('Unknown error occured'));
      } catch (err) {
        return dispatch(error('Failed to fetch data: server is not available'));
      }
    };
  };
}
