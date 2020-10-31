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

export type ActionCreatorComposer<A> = () => A;
export type ActionCreatorParameterizedComposer<A, D> = (data?: D) => A;

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type ApiResponseHandler<A extends Action, R> = (response: Response, dispatch: Dispatch<A>) => R | Promise<R>;

export interface ApiOptions<SA extends Action, EA extends Action, SD> {
  url: string;
  method?: ApiMethod;
  contentType?: string;
  onSuccess?: ApiResponseHandler<SA, SD>;
  onError?: ApiResponseHandler<EA, string>;
}

export interface AsyncActionBuilderOptions<RA extends Action, SA extends Action, EA extends Action, SD> {
  makeRequest(): ActionCreatorComposer<RA>;
  makeSuccess(): ActionCreatorParameterizedComposer<SA, SD>;
  makeError(): ActionCreatorParameterizedComposer<EA, string>;
  apiOptions: ApiOptions<SA, EA, SD>;
}

export function createAsyncAction<
  RA extends RequestAction<RC, RP>,
  SA extends SuccessAction<SC, SD>,
  EA extends ErrorAction<EC>,
  RC extends string,
  SC extends string,
  EC extends string,
  RP,
  SD,
  D = void,
  P = void
>({
  makeRequest,
  makeSuccess,
  makeError,
  apiOptions,
}: AsyncActionBuilderOptions<RA, SA, EA, SD>): ActionCreator<ThunkAction<Promise<SA | EA>, D, P, SA | EA>> {
  function getHeaders(contentType?: string): Record<string, string> {
    const headers = {};

    if (!contentType) {
      Object.assign(headers, { 'Content-Type': 'application/json' });
    }

    return headers;
  }

  const request = makeRequest();
  const success = makeSuccess();
  const error = makeError();

  const { url, method = 'GET', contentType = 'application/json', onSuccess, onError } = apiOptions;

  const headers = getHeaders(contentType);

  return () => {
    return async (dispatch: Dispatch<RA | SA | EA>): Promise<SA | EA> => {
      dispatch(request());

      try {
        const response = await fetch(url, {
          method,
          headers,
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
        return dispatch(error());
      } catch (err) {
        return dispatch(error());
      }
    };
  };
}
