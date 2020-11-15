import configureStore from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { createAsyncAction, ErrorAction, RequestAction, SuccessAction } from '../action-creator-helpers';

const mockStore = configureStore<TestRecordsState, GetTestRecordsDispatch>([thunk]);
const store = mockStore();
const fetchMock = jest.fn() as jest.Mock<Promise<Response>>;

global.fetch = fetchMock;

type TestRecord = {
  id: number;
  name: string;
  age: number;
};

type TestRecordsState = {
  records: TestRecord[];
};

type GetTestRecordsRequest = {
  filterByName: string;
  ageLimit: number;
};

enum GetTestRecordsActionTypes {
  Request = 'GET_TEST_RECORDS_REQUEST',
  Success = 'GET_TEST_RECORDS_SUCCESS',
  Error = 'GET_TEST_RECORDS_ERROR',
}

type GetTestRecordsRequestAction = RequestAction<GetTestRecordsActionTypes.Request, GetTestRecordsRequest>;
type GetTestRecordsSuccessAction = SuccessAction<
  GetTestRecordsActionTypes.Success,
  TestRecord[],
  GetTestRecordsRequest
>;
type GetTestRecordsErrorAction = ErrorAction<GetTestRecordsActionTypes.Error, GetTestRecordsRequest>;

type GetTestRecordsDispatch = ThunkDispatch<
  TestRecord[],
  GetTestRecordsRequest,
  GetTestRecordsSuccessAction | GetTestRecordsErrorAction
>;

describe('createAsyncAction', () => {
  const receivedRecords: TestRecord[] = [
    {
      id: 1,
      name: 'John',
      age: 34,
    },
    {
      id: 2,
      name: 'Mike',
      age: 26,
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
    store.clearActions();
  });

  test('should dispatch request and success actions if response is ok', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload,
    };
    const expectedSuccessAction: GetTestRecordsSuccessAction = {
      type: GetTestRecordsActionTypes.Success,
      data: {} as TestRecord[],
      payload,
    };

    fetchMock.mockResolvedValue({ ...new Response(), ok: true });

    // Act
    const getTestRecords = createAsyncAction<TestRecord[], GetTestRecordsRequest>(
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      { baseUrl: 'test url' },
      'Loading test records',
    );

    await store.dispatch(getTestRecords(payload));

    // Assert
    expect(store.getActions()).toEqual([expectedRequestAction, expectedSuccessAction]);
  });

  test('should dispatch request and error actions if response is not ok', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload,
    };
    const expectedErrorAction: GetTestRecordsErrorAction = {
      type: GetTestRecordsActionTypes.Error,
      errorMessage: 'Unknown error occured',
      payload,
    };

    fetchMock.mockResolvedValue({ ...new Response(), ok: false });

    // Act
    const getTestRecords = createAsyncAction<TestRecord[], GetTestRecordsRequest>(
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      { baseUrl: 'test url' },
      'Loading test records',
    );

    await store.dispatch(getTestRecords(payload));

    // Assert
    expect(store.getActions()).toEqual([expectedRequestAction, expectedErrorAction]);
  });

  test('should dispatch request and error actions if response is rejected', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload,
    };
    const expectedErrorAction: GetTestRecordsErrorAction = {
      type: GetTestRecordsActionTypes.Error,
      errorMessage: 'Failed to fetch data',
      payload,
    };

    fetchMock.mockRejectedValue(new Response());

    // Act
    const getTestRecords = createAsyncAction<TestRecord[], GetTestRecordsRequest>(
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      { baseUrl: 'test url' },
      'Loading test records',
    );

    await store.dispatch(getTestRecords(payload));

    // Assert
    expect(store.getActions()).toEqual([expectedRequestAction, expectedErrorAction]);
  });

  test('should dispatch request action, transform successful response and dispatch success with transformed data if response is ok', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload,
    };
    const expectedSuccessAction: GetTestRecordsSuccessAction = {
      type: GetTestRecordsActionTypes.Success,
      data: receivedRecords,
      payload,
    };

    const onSuccessMock = jest.fn().mockResolvedValue(receivedRecords);

    fetchMock.mockResolvedValue({ ...new Response(), ok: true });

    // Act
    const getTestRecords = createAsyncAction<TestRecord[], GetTestRecordsRequest>(
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      {
        baseUrl: 'test url',
        onSuccess: onSuccessMock,
      },
      'Loading test records',
    );

    await store.dispatch(getTestRecords(payload));

    // Assert
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toEqual([expectedRequestAction, expectedSuccessAction]);
  });

  test('should dispatch request action, transform error response and dispatch error with transformed data if response is not ok', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload,
    };
    const expectedErrorAction: GetTestRecordsErrorAction = {
      type: GetTestRecordsActionTypes.Error,
      errorMessage: 'Error',
      payload,
    };

    const onErrorMock = jest.fn().mockResolvedValue('Error');

    fetchMock.mockResolvedValue({ ...new Response(), ok: false });

    // Act
    const getTestRecords = createAsyncAction<TestRecord[], GetTestRecordsRequest>(
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      {
        baseUrl: 'test url',
        onError: onErrorMock,
      },
      'Loading test records',
    );

    await store.dispatch(getTestRecords(payload));

    // Assert
    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toEqual([expectedRequestAction, expectedErrorAction]);
  });

  test('should dispatch request action, transform error response and dispatch error with transformed data if response is rejected', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload,
    };
    const expectedErrorAction: GetTestRecordsErrorAction = {
      type: GetTestRecordsActionTypes.Error,
      errorMessage: 'Error',
      payload,
    };

    const onErrorMock = jest.fn().mockResolvedValue('Error');

    fetchMock.mockRejectedValue(new Response());

    // Act
    const getTestRecords = createAsyncAction<TestRecord[], GetTestRecordsRequest>(
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      {
        baseUrl: 'test url',
        onError: onErrorMock,
      },
      'Loading test records',
    );

    await store.dispatch(getTestRecords(payload));

    // Assert
    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toEqual([expectedRequestAction, expectedErrorAction]);
  });

  test('should fetch data with specified url, method and content-type', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };

    // Act
    const action1 = createAsyncAction(
      'request',
      'success',
      'error',
      {
        baseUrl: 'test url',
        method: 'POST',
        contentType: 'application/json',
      },
      'Loading test records',
    );
    const action2 = createAsyncAction('request', 'success', 'error', {
      baseUrl: 'test url 2',
      method: 'POST',
    });
    const action3 = createAsyncAction('request', 'success', 'error', {
      baseUrl: 'test url 3',
      method: 'POST',
      contentType: 'none',
    });

    await action1(payload)(jest.fn(), jest.fn(), {});
    await action2(payload)(jest.fn(), jest.fn(), {});
    await action3(payload)(jest.fn(), jest.fn(), {});

    // Assert
    expect(fetchMock).toHaveBeenCalledWith('test url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'test url 2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(3, 'test url 3', {
      method: 'POST',
    });
  });

  test('should fetch data with modified url, specified method and content-type', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const modifyUrlMock = jest.fn().mockReturnValue('test url (modified)');

    // Act
    const action = createAsyncAction(
      'request',
      'success',
      'error',
      {
        baseUrl: 'test url',
        method: 'POST',
        contentType: 'application/json',
        modifyUrl: modifyUrlMock,
      },
      'Loading test records',
    );

    await action(payload)(jest.fn(), jest.fn(), {});

    // Assert
    expect(modifyUrlMock).toHaveBeenCalledWith('test url', payload);
    expect(fetchMock).toHaveBeenCalledWith('test url (modified)', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  test('should fetch data with specified url, method, content-type and constructed body', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const payloadBody = JSON.stringify(payload);
    const constructBodyMock = jest.fn().mockReturnValue(payloadBody);

    // Act
    const action = createAsyncAction(
      'request',
      'success',
      'error',
      {
        baseUrl: 'test url',
        method: 'POST',
        contentType: 'application/json',
        constructBody: constructBodyMock,
      },
      'Loading test records',
    );

    await action(payload)(jest.fn(), jest.fn(), {});

    // Assert
    expect(fetchMock).toHaveBeenCalledWith('test url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadBody,
    });
    expect(constructBodyMock).toHaveBeenCalledWith(payload);
  });
});
