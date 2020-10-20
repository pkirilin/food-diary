import { readBadRequestResponseAsync } from '../bad-request-response-reader';

const readBadRequestResponseAsyncTestData = [
  {
    caseName: 'common message if no error messages received from server',
    badRequestObjectFromServer: {
      errors: {},
    },
    expectedResult: 'Wrong request data',
  },
  {
    caseName: 'all error messages separated by a dot if errors object exists in response',
    badRequestObjectFromServer: {
      test: ['some error'],
      errors: {
        foo: ['foo error 1', 'foo error 2'],
        bar: ['bar error 1', 'bar error 2'],
      },
    },
    expectedResult: 'foo error 1. foo error 2. bar error 1. bar error 2',
  },
  {
    caseName: "all error messages separated by a dot if errors object doesn't exist in response",
    badRequestObjectFromServer: {
      test: ['some error'],
      another: ['another error', 'another error 2'],
    },
    expectedResult: 'some error. another error. another error 2',
  },
];

describe('utils (bad request response reader)', () => {
  describe('readBadRequestResponseAsync', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    readBadRequestResponseAsyncTestData.forEach(({ caseName, badRequestObjectFromServer, expectedResult }) => {
      test(`should return ${caseName}`, async () => {
        // Arrange
        const response = new Response();
        const responseJsonSpy = jest.spyOn(response, 'json').mockResolvedValue(badRequestObjectFromServer);

        // Act
        const result = await readBadRequestResponseAsync(response);

        // Assert
        expect(responseJsonSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expectedResult);
      });
    });
  });
});
