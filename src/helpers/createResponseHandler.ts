import { Action, Dispatch } from 'redux';
import { ApiErrorResponseHandler, ApiSuccessResponseHandler } from './createAsyncAction';

export type MessageDispatcher<A extends Action> = (dispatch: Dispatch<A>, message: string) => void;

export function createErrorResponseHandler<A extends Action>(
  baseErrorMessage = 'Failed to fetch',
  errorMessageDispatcher?: MessageDispatcher<A>,
): ApiErrorResponseHandler<A, string> {
  function composeErrorMessage(baseError: string, detailedError: string): string {
    return `${baseError}: ${detailedError}`;
  }

  async function getErrorMessageByResponseAsync(response?: Response): Promise<string> {
    if (!response) {
      return composeErrorMessage(baseErrorMessage, 'server is not available');
    }

    switch (response.status) {
      case 400:
        return composeErrorMessage(baseErrorMessage, 'wrong request data');
      case 404:
        return composeErrorMessage(baseErrorMessage, 'not found');
      case 500:
        return composeErrorMessage(baseErrorMessage, 'internal server error');
      default:
        return composeErrorMessage(baseErrorMessage, 'unknown response code');
    }
  }

  return async (dispatch, response): Promise<string> => {
    const errorMessage = await getErrorMessageByResponseAsync(response);

    if (errorMessageDispatcher) {
      errorMessageDispatcher(dispatch, errorMessage);
    }

    return errorMessage;
  };
}

export function createSuccessResponseHandler<A extends Action, D = {}>(
  responseTransformer: (response: Response) => Promise<D>,
): ApiSuccessResponseHandler<A, D> {
  return async (dispatch, response): Promise<D> => {
    const data = await responseTransformer(response);
    return data;
  };
}
