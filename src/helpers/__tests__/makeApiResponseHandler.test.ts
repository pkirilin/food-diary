import { Action } from 'redux';
import {
  makeApiResponseHandler,
  ApiResponseStatusCodeHandler,
  ApiResponseHandlerCreator,
} from '../makeApiResponseHandler';

type TestErrorAction = Action;

function getTestErrorHandler(): ApiResponseHandlerCreator<TestErrorAction, string> {
  const badRequestHandler: ApiResponseStatusCodeHandler<TestErrorAction, string> = async (
    response,
    dispatch,
    message = '',
  ) => {
    const messageFromServer = await response.text();
    return `${message}: ${messageFromServer}`;
  };
  const intenalServerErrorHandler: ApiResponseStatusCodeHandler<TestErrorAction, string> = (
    response,
    dispatch,
    message = '',
  ) => message;

  return makeApiResponseHandler<TestErrorAction, string>({
    defaultHandler: () => 'unknown response code',
    statusCodeHandlers: {
      [400]: badRequestHandler,
      [500]: intenalServerErrorHandler,
    },
  });
}

describe('makeApiResponseHandler', () => {
  test('should make response handler which handles unknown status code with default handler', () => {
    // Arrange
    const createErrorHandler = getTestErrorHandler();
    const responseHandler = createErrorHandler();
    const response: Response = {
      ...new Response(),
      status: -1,
    };
    const dispatchMock = jest.fn();

    // Act
    const result = responseHandler(response, dispatchMock);

    // Assert
    expect(result).toEqual('unknown response code');
  });

  test('should make response handler which handles status code with existing handler and returns message if message is specified', () => {
    // Arrange
    const createErrorHandler = getTestErrorHandler();
    const responseHandler = createErrorHandler({
      [500]: 'test internal server error',
    });
    const response: Response = {
      ...new Response(),
      status: 500,
    };
    const dispatchMock = jest.fn();

    // Act
    const result = responseHandler(response, dispatchMock);

    // Assert
    expect(result).toEqual('test internal server error');
  });

  test('should make response handler which handles status code with existing handler and returns status text if message is not specified', () => {
    // Arrange
    const createErrorHandler = getTestErrorHandler();
    const responseHandler = createErrorHandler();
    const response: Response = {
      ...new Response(),
      status: 500,
      statusText: 'some status text message',
    };
    const dispatchMock = jest.fn();

    // Act
    const result = responseHandler(response, dispatchMock);

    // Assert
    expect(result).toEqual('some status text message');
  });

  test('should make response handler which handles status code with existing handler asynchonously', async () => {
    // Arrange
    const createErrorHandler = getTestErrorHandler();
    const responseHandler = createErrorHandler({ [400]: 'Bad request' });
    const responseTextMock = jest.fn().mockResolvedValue('server received some wrong data');
    const response: Response = {
      ...new Response(),
      status: 400,
      text: responseTextMock,
    };
    const dispatchMock = jest.fn();

    // Act
    const result = await responseHandler(response, dispatchMock);

    // Assert
    expect(responseTextMock).toHaveBeenCalled();
    expect(result).toEqual('Bad request: server received some wrong data');
  });
});
