import { Action, ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';

export interface RequestAction<A, P = {}> extends Action<A> {
  requestMessage: string;
  payload: P;
}

export interface SuccessAction<A, D = {}, P = {}> extends Action<A> {
  data: D;
  payload: P;
}

export interface ErrorAction<A, P = {}> extends Action<A> {
  errorMessage: string;
  payload: P;
}

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ApiRequestBody = string | FormData | null;

export type ApiSuccessResponseHandler<A extends Action, R> = (
  dispatch: Dispatch<A>,
  response: Response,
) => R | Promise<R>;

export type ApiErrorResponseHandler<A extends Action, R> = (
  dispatch: Dispatch<A>,
  // Response is optional because handler might not received any response in case of error
  response?: Response,
) => R | Promise<R>;

export type ApiRequestUrlModifier<P> = (baseUrl: string, payload: P) => string;
export type ApiRequestBodyConstructor<P> = (payload: P) => ApiRequestBody;

export interface ApiOptions<S, E, D, P> {
  baseUrl: string;
  method?: ApiMethod;
  contentType?: string;
  onSuccess?: ApiSuccessResponseHandler<SuccessAction<S, D, P>, D>;
  onError?: ApiErrorResponseHandler<ErrorAction<E, P>, string>;
  modifyUrl?: ApiRequestUrlModifier<P>;
  constructBody?: ApiRequestBodyConstructor<P>;
}

type RequestHeadersFragment = Pick<RequestInit, 'headers'>;
type RequestBodyFragment = Pick<RequestInit, 'body'>;

export type ThunkHelperResultActions<S, E, D = {}, P = {}> = SuccessAction<S, D, P> | ErrorAction<E, P>;

export type ThunkHelperAllActions<R, S, E, D = {}, P = {}> =
  | RequestAction<R, P>
  | SuccessAction<S, D, P>
  | ErrorAction<E, P>;

export type ThunkHelperAction<S, E, D = {}, P = {}> = ThunkAction<
  Promise<ThunkHelperResultActions<S, E, D, P>>,
  D,
  P,
  ThunkHelperResultActions<S, E, D, P>
>;

export function createAsyncAction<D = {}, P = {}, R = string, S = string, E = string>(
  requestActionType: R,
  successActionType: S,
  errorActionType: E,
  apiOptions: ApiOptions<S, E, D, P>,
  requestMessage = 'Performing request',
): ActionCreator<ThunkHelperAction<S, E, D, P>> {
  const {
    baseUrl,
    method = 'GET',
    contentType = 'application/json',
    modifyUrl,
    constructBody,
    onSuccess,
    onError,
  } = apiOptions;

  function getRequestUrl(baseUrl: string, payload: P, modifyUrl?: ApiRequestUrlModifier<P>): string {
    return modifyUrl ? modifyUrl(baseUrl, payload) : baseUrl;
  }

  function getHeaders(contentType?: string): RequestHeadersFragment {
    return contentType ? { headers: { 'Content-Type': contentType } } : {};
  }

  function getBody(payload: P, constructBody?: ApiRequestBodyConstructor<P>): RequestBodyFragment {
    return constructBody ? { body: constructBody(payload) } : {};
  }

  return (payload: P): ThunkHelperAction<S, E, D, P> => {
    const createRequest = (payload: P): RequestAction<R, P> => ({
      type: requestActionType,
      requestMessage,
      payload,
    });

    const createSuccess = (data: D, payload: P): SuccessAction<S, D, P> => ({
      type: successActionType,
      data,
      payload,
    });

    const createError = (errorMessage: string, payload: P): ErrorAction<E, P> => ({
      type: errorActionType,
      errorMessage,
      payload,
    });

    type TDispatch = Dispatch<RequestAction<R, P> | SuccessAction<S, D, P> | ErrorAction<E, P>>;

    return async (dispatch: TDispatch): Promise<ThunkHelperResultActions<S, E, D, P>> => {
      dispatch(createRequest(payload));

      const requestUrl = getRequestUrl(baseUrl, payload, modifyUrl);

      try {
        const response = await fetch(requestUrl, {
          method,
          ...getHeaders(contentType),
          ...getBody(payload, constructBody),
        });

        if (response.ok) {
          if (onSuccess) {
            const data = await onSuccess(dispatch, response);
            return dispatch(createSuccess(data, payload));
          }

          return dispatch(createSuccess({} as D, payload));
        }

        if (onError) {
          const errorMessage = await onError(dispatch, response);
          return dispatch(createError(errorMessage, payload));
        }

        return dispatch(createError('Unknown error occured', payload));
      } catch (err) {
        if (onError) {
          const errorMessage = await onError(dispatch);
          return dispatch(createError(errorMessage, payload));
        }

        return dispatch(createError('Failed to fetch data', payload));
      }
    };
  };
}
