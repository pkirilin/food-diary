import { Action, Dispatch } from 'redux';
import { ApiResponseHandler } from './createAsyncAction';

export type ApiResponseStatusCodeHandler<A extends Action, R> = (
  response: Response,
  dispatch: Dispatch<A>,
  message?: string,
) => R | Promise<R>;

export type ApiResponseStatusCodeHandlersObject<A extends Action, R> = {
  [statusCode: number]: ApiResponseStatusCodeHandler<A, R>;
};

export interface ApiResponseHandlerOptions<A extends Action, R> {
  defaultHandler: ApiResponseStatusCodeHandler<A, R>;
  statusCodeHandlers?: ApiResponseStatusCodeHandlersObject<A, R>;
}

export type ApiResponseStatusCodeMessages = Record<number, string>;

export type ApiResponseHandlerCreator<A extends Action, R> = (
  messages?: ApiResponseStatusCodeMessages,
) => ApiResponseHandler<A, R>;

export function makeApiResponseHandler<A extends Action, R>({
  defaultHandler,
  statusCodeHandlers = {},
}: ApiResponseHandlerOptions<A, R>): ApiResponseHandlerCreator<A, R> {
  function getMessageByResponse(response: Response, messages: ApiResponseStatusCodeMessages = {}): string {
    const message = messages[response.status];

    if (message) {
      return message;
    }

    return response.statusText;
  }

  return messages => {
    return (response, dispatch): R | Promise<R> => {
      const handleResponse = statusCodeHandlers[response.status];

      if (handleResponse) {
        const message = getMessageByResponse(response, messages);
        return handleResponse(response, dispatch, message);
      }

      return defaultHandler(response, dispatch);
    };
  };
}
