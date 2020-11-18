import { Action } from 'redux';
import {
  createErrorResponseHandler,
  createSuccessBlobResponseHandler,
  createSuccessJsonResponseHandler,
  createSuccessNumberResponseHandler,
  createSuccessTextResponseHandler,
} from '../response-handler-helpers';

type TestAction = Action<'TEST'>;

type TestRecord = {
  id: number;
  name: string;
};

describe('createErrorResponseHandler', () => {
  const errorHandlerTestData = [
    {
      baseErrorMessage: 'Base error message',
      response: { status: 400 } as Response,
      expectedErrorMessage: 'Base error message: wrong request data',
    },
    {
      baseErrorMessage: 'Base error message',
      response: { status: 404 } as Response,
      expectedErrorMessage: 'Base error message: data not found',
    },
    {
      baseErrorMessage: 'Base error message',
      response: { status: 500 } as Response,
      expectedErrorMessage: 'Base error message: internal server error',
    },
    {
      baseErrorMessage: 'Base error message',
      response: { status: -111 } as Response,
      expectedErrorMessage: 'Base error message: unknown response code',
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  errorHandlerTestData.forEach(({ baseErrorMessage, response, expectedErrorMessage }) => {
    test(`should create handler which receives message '${expectedErrorMessage}' on status '${response.status}'`, async () => {
      // Act
      const getErrorMessage = createErrorResponseHandler(baseErrorMessage);
      const errorMessage = await getErrorMessage(response);

      // Assert
      expect(errorMessage).toBe(expectedErrorMessage);
    });
  });

  test(`should create handler which receives message 'server is not available' if response is undefined`, async () => {
    // Act
    const getErrorMessage = createErrorResponseHandler();
    const errorMessage = await getErrorMessage();

    // Assert
    expect(errorMessage).toBe('Failed to fetch: server is not available');
  });

  test('should create handler which transforms received response if response transformer is specified', async () => {
    // Arrange
    const responseTransformerMock = jest.fn().mockResolvedValue('TRANSFORMED MESSAGE');
    const response: Response = {
      ...new Response(),
      status: 400,
    };

    // Act
    const getErrorMessage = createErrorResponseHandler('TEST', {
      [400]: responseTransformerMock,
    });
    const errorMessage = await getErrorMessage(response);

    // Assert
    expect(responseTransformerMock).toHaveBeenCalledWith(response);
    expect(errorMessage).toBe('TEST: TRANSFORMED MESSAGE');
  });
});

describe('createSuccessJsonResponseHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create handler which receives JSON data from response', async () => {
    // Arrange
    const expectedRecords: TestRecord[] = [
      {
        id: 1,
        name: 'Test1',
      },
      {
        id: 2,
        name: 'Test2',
      },
    ];
    const response: Response = {
      ...new Response(),
      json: jest.fn().mockResolvedValue(expectedRecords),
    };

    // Act
    const getJsonTestRecords = createSuccessJsonResponseHandler<TestRecord[]>();
    const records = await getJsonTestRecords(response);

    // Assert
    expect(records).toEqual(expectedRecords);
  });
});

describe('createSuccessNumberResponseHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create handler which receives number from response', async () => {
    // Arrange
    const expectedNumber = 123;
    const response: Response = {
      ...new Response(),
      text: jest.fn().mockResolvedValue('123'),
    };

    // Act
    const getNumber = createSuccessNumberResponseHandler();
    const number = await getNumber(response);

    // Assert
    expect(number).toBe(expectedNumber);
  });
});

describe('createSuccessTextResponseHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create handler which receives string from response', async () => {
    // Arrange
    const expectedText = 'hello world';
    const response: Response = {
      ...new Response(),
      text: jest.fn().mockResolvedValue('hello world'),
    };

    // Act
    const getText = createSuccessTextResponseHandler();
    const text = await getText(response);

    // Assert
    expect(text).toBe(expectedText);
  });
});

describe('createSuccessBlobResponseHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create handler which receives blob from response', async () => {
    // Arrange
    const expectedBlob = new Blob(['this', 'is', 'test', 'blob']);
    const response: Response = {
      ...new Response(),
      blob: jest.fn().mockResolvedValue(expectedBlob),
    };

    // Act
    const getBlob = createSuccessBlobResponseHandler();
    const blob = await getBlob(response);

    // Assert
    expect(blob).toBe(expectedBlob);
  });
});
