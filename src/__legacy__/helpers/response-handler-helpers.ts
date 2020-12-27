import { ApiErrorResponseHandler, ApiSuccessResponseHandler } from './action-creator-helpers';

export type ResponseTransformer<T> = (response: Response) => T | Promise<T>;

export function createErrorResponseHandler(
  baseErrorMessage = 'Failed to fetch',
  statusCodeTransformers: Record<number, ResponseTransformer<string>> = {},
): ApiErrorResponseHandler<string> {
  // Each response code (supported for handling) should have default error message
  const defaultErrorMessagesByStatusCode = {
    400: 'wrong request data',
    404: 'data not found',
    500: 'internal server error',
  } as Record<number, string>;

  function formatErrorMessage(errorMessage: string): string {
    return `${baseErrorMessage}: ${errorMessage}`;
  }

  return async (response): Promise<string> => {
    if (!response) {
      return formatErrorMessage('server is not available');
    }

    const defaultErrorMessage = defaultErrorMessagesByStatusCode[response.status];
    if (!defaultErrorMessage) {
      return formatErrorMessage('unknown response code');
    }

    const responseTransformer = statusCodeTransformers[response.status];
    if (!responseTransformer) {
      return formatErrorMessage(defaultErrorMessage);
    }

    const transformedErrorMessage = await responseTransformer(response);
    return formatErrorMessage(transformedErrorMessage);
  };
}

export function createSuccessJsonResponseHandler<D = {}>(): ApiSuccessResponseHandler<D> {
  return async (response): Promise<D> => response.json();
}

export function createSuccessNumberResponseHandler(): ApiSuccessResponseHandler<number> {
  return async (response): Promise<number> => {
    const responseText = await response.text();

    if (isNaN(+responseText)) {
      throw new Error('Failed to convert text response to number');
    }

    return +responseText;
  };
}

export function createSuccessTextResponseHandler(): ApiSuccessResponseHandler<string> {
  return async (response): Promise<string> => response.text();
}

export function createSuccessBlobResponseHandler(): ApiSuccessResponseHandler<Blob> {
  return async (response): Promise<Blob> => response.blob();
}
