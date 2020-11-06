import { Action, Dispatch } from 'redux';
import { ApiErrorResponseHandler, ApiSuccessResponseHandler } from './createAsyncAction';

export type MessageDispatcher<A extends Action> = (dispatch: Dispatch<A>, message: string) => void;
export type ResponseTransformer<D> = (response: Response) => D | Promise<D>;

export function createErrorResponseHandler<A extends Action>(
  baseErrorMessage = 'Failed to fetch',
  responseTransformersByStatusCode: Record<number, ResponseTransformer<string>> = {},
  errorMessageDispatcher?: MessageDispatcher<A>,
): ApiErrorResponseHandler<A, string> {
  // Each response code (supported for handling) should have default error message
  const defaultErrorMessagesByStatusCode = {
    400: 'wrong request data',
    404: 'data not found',
    500: 'internal server error',
  } as Record<number, string>;

  function formatErrorMessage(errorMessage: string): string {
    return `${baseErrorMessage}: ${errorMessage}`;
  }

  async function getErrorMessageByResponseAsync(response?: Response): Promise<string> {
    if (!response) {
      return formatErrorMessage('server is not available');
    }

    const defaultErrorMessage = defaultErrorMessagesByStatusCode[response.status];
    const responseTransformer = responseTransformersByStatusCode[response.status];

    if (!defaultErrorMessage) {
      return formatErrorMessage('unknown response code');
    }

    if (!responseTransformer) {
      return formatErrorMessage(defaultErrorMessage);
    }

    const transformedErrorMessage = await responseTransformer(response);
    return formatErrorMessage(transformedErrorMessage);
  }

  return async (dispatch, response): Promise<string> => {
    const errorMessage = await getErrorMessageByResponseAsync(response);

    if (errorMessageDispatcher) {
      errorMessageDispatcher(dispatch, errorMessage);
    }

    return errorMessage;
  };
}

export function createSuccessJsonResponseHandler<A extends Action, D = {}>(): ApiSuccessResponseHandler<A, D> {
  return async (dispatch, response): Promise<D> => response.json();
}
