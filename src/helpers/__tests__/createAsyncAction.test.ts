import configureStore from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { createAsyncAction, ErrorAction, RequestAction, SuccessAction } from '../createAsyncAction';

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
type GetTestRecordsSuccessAction = SuccessAction<GetTestRecordsActionTypes.Success, TestRecord[]>;
type GetTestRecordsErrorAction = ErrorAction<GetTestRecordsActionTypes.Error>;

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
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload: {
        filterByName: 'John',
        ageLimit: 40,
      },
    };
    const expectedSuccessAction: GetTestRecordsSuccessAction = {
      type: GetTestRecordsActionTypes.Success,
      data: receivedRecords,
    };

    const makeRequestMock = jest.fn().mockReturnValue(() => expectedRequestAction);
    const makeSuccessMock = jest.fn().mockReturnValue(() => expectedSuccessAction);
    const makeErrorMock = jest.fn();

    fetchMock.mockResolvedValue({ ...new Response(), ok: true });

    // Act
    const getTestRecords = createAsyncAction<
      GetTestRecordsRequestAction,
      GetTestRecordsSuccessAction,
      GetTestRecordsErrorAction,
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      TestRecord[],
      GetTestRecordsRequest
    >({
      makeRequest: makeRequestMock,
      makeSuccess: makeSuccessMock,
      makeError: makeErrorMock,
      apiOptions: { baseUrl: 'test url' },
    });

    await store.dispatch(getTestRecords());

    // Assert
    expect(makeRequestMock).toHaveBeenCalledTimes(1);
    expect(makeSuccessMock).toHaveBeenCalledTimes(1);
    expect(makeErrorMock).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toEqual([expectedRequestAction, expectedSuccessAction]);
  });

  test('should dispatch request and error actions if response is not ok', async () => {
    // Arrange
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload: {
        filterByName: 'John',
        ageLimit: 40,
      },
    };
    const expectedErrorAction: GetTestRecordsErrorAction = {
      type: GetTestRecordsActionTypes.Error,
      errorMessage: 'Error',
    };

    const makeRequestMock = jest.fn().mockReturnValue(() => expectedRequestAction);
    const makeSuccessMock = jest.fn();
    const makeErrorMock = jest.fn().mockReturnValue(() => expectedErrorAction);

    fetchMock.mockResolvedValue({ ...new Response(), ok: false });

    // Act
    const getTestRecords = createAsyncAction<
      GetTestRecordsRequestAction,
      GetTestRecordsSuccessAction,
      GetTestRecordsErrorAction,
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      TestRecord[],
      GetTestRecordsRequest
    >({
      makeRequest: makeRequestMock,
      makeSuccess: makeSuccessMock,
      makeError: makeErrorMock,
      apiOptions: { baseUrl: 'test url' },
    });

    await store.dispatch(getTestRecords());

    // Assert
    expect(makeRequestMock).toHaveBeenCalledTimes(1);
    expect(makeSuccessMock).toHaveBeenCalledTimes(1);
    expect(makeErrorMock).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toEqual([expectedRequestAction, expectedErrorAction]);
  });

  test('should dispatch request and error actions if response is rejected', async () => {
    // Arrange
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload: {
        filterByName: 'John',
        ageLimit: 40,
      },
    };
    const expectedErrorAction: GetTestRecordsErrorAction = {
      type: GetTestRecordsActionTypes.Error,
      errorMessage: 'Error',
    };

    const makeRequestMock = jest.fn().mockReturnValue(() => expectedRequestAction);
    const makeSuccessMock = jest.fn();
    const makeErrorMock = jest.fn().mockReturnValue(() => expectedErrorAction);

    fetchMock.mockRejectedValue(new Response());

    // Act
    const getTestRecords = createAsyncAction<
      GetTestRecordsRequestAction,
      GetTestRecordsSuccessAction,
      GetTestRecordsErrorAction,
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      TestRecord[],
      GetTestRecordsRequest
    >({
      makeRequest: makeRequestMock,
      makeSuccess: makeSuccessMock,
      makeError: makeErrorMock,
      apiOptions: { baseUrl: 'test url' },
    });

    await store.dispatch(getTestRecords());

    // Assert
    expect(makeRequestMock).toHaveBeenCalledTimes(1);
    expect(makeSuccessMock).toHaveBeenCalledTimes(1);
    expect(makeErrorMock).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toEqual([expectedRequestAction, expectedErrorAction]);
  });

  test('should dispatch request action, transform successful response and dispatch success with transformed data if response is ok', async () => {
    // Arrange
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload: {
        filterByName: 'John',
        ageLimit: 40,
      },
    };
    const expectedSuccessAction: GetTestRecordsSuccessAction = {
      type: GetTestRecordsActionTypes.Success,
      data: receivedRecords,
    };

    const successActionCreatorMock = jest.fn().mockReturnValue(expectedSuccessAction);
    const onSuccessMock = jest.fn().mockResolvedValue(receivedRecords);
    const makeRequestMock = jest.fn().mockReturnValue(() => expectedRequestAction);
    const makeSuccessMock = jest.fn().mockReturnValue(successActionCreatorMock);
    const makeErrorMock = jest.fn();

    fetchMock.mockResolvedValue({ ...new Response(), ok: true });

    // Act
    const getTestRecords = createAsyncAction<
      GetTestRecordsRequestAction,
      GetTestRecordsSuccessAction,
      GetTestRecordsErrorAction,
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      TestRecord[],
      GetTestRecordsRequest
    >({
      makeRequest: makeRequestMock,
      makeSuccess: makeSuccessMock,
      makeError: makeErrorMock,
      apiOptions: {
        baseUrl: 'test url',
        onSuccess: onSuccessMock,
      },
    });

    await store.dispatch(getTestRecords());

    // Assert
    expect(makeRequestMock).toHaveBeenCalledTimes(1);
    expect(makeSuccessMock).toHaveBeenCalledTimes(1);
    expect(makeErrorMock).toHaveBeenCalledTimes(1);
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toEqual([expectedRequestAction, expectedSuccessAction]);
  });

  test('should dispatch request action, transform error response and dispatch error with transformed data if response is not ok', async () => {
    // Arrange
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload: {
        filterByName: 'John',
        ageLimit: 40,
      },
    };
    const expectedErrorAction: GetTestRecordsErrorAction = {
      type: GetTestRecordsActionTypes.Error,
      errorMessage: 'Error',
    };

    const onErrorMock = jest.fn().mockResolvedValue('Error');
    const makeRequestMock = jest.fn().mockReturnValue(() => expectedRequestAction);
    const makeSuccessMock = jest.fn();
    const makeErrorMock = jest.fn().mockReturnValue(() => expectedErrorAction);

    fetchMock.mockResolvedValue({ ...new Response(), ok: false });

    // Act
    const getTestRecords = createAsyncAction<
      GetTestRecordsRequestAction,
      GetTestRecordsSuccessAction,
      GetTestRecordsErrorAction,
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      TestRecord[],
      GetTestRecordsRequest
    >({
      makeRequest: makeRequestMock,
      makeSuccess: makeSuccessMock,
      makeError: makeErrorMock,
      apiOptions: {
        baseUrl: 'test url',
        onError: onErrorMock,
      },
    });

    await store.dispatch(getTestRecords());

    // Assert
    expect(makeRequestMock).toHaveBeenCalledTimes(1);
    expect(makeSuccessMock).toHaveBeenCalledTimes(1);
    expect(makeErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toEqual([expectedRequestAction, expectedErrorAction]);
  });

  test('should dispatch request action, transform error response and dispatch error with transformed data if response is rejected', async () => {
    // Arrange
    const expectedRequestAction: GetTestRecordsRequestAction = {
      type: GetTestRecordsActionTypes.Request,
      requestMessage: 'Loading test records',
      payload: {
        filterByName: 'John',
        ageLimit: 40,
      },
    };
    const expectedErrorAction: GetTestRecordsErrorAction = {
      type: GetTestRecordsActionTypes.Error,
      errorMessage: 'Error',
    };

    const onErrorMock = jest.fn().mockResolvedValue('Error');
    const makeRequestMock = jest.fn().mockReturnValue(() => expectedRequestAction);
    const makeSuccessMock = jest.fn();
    const makeErrorMock = jest.fn().mockReturnValue(() => expectedErrorAction);

    fetchMock.mockRejectedValue(new Response());

    // Act
    const getTestRecords = createAsyncAction<
      GetTestRecordsRequestAction,
      GetTestRecordsSuccessAction,
      GetTestRecordsErrorAction,
      GetTestRecordsActionTypes.Request,
      GetTestRecordsActionTypes.Success,
      GetTestRecordsActionTypes.Error,
      TestRecord[],
      GetTestRecordsRequest
    >({
      makeRequest: makeRequestMock,
      makeSuccess: makeSuccessMock,
      makeError: makeErrorMock,
      apiOptions: {
        baseUrl: 'test url',
        onError: onErrorMock,
      },
    });

    await store.dispatch(getTestRecords());

    // Assert
    expect(makeRequestMock).toHaveBeenCalledTimes(1);
    expect(makeSuccessMock).toHaveBeenCalledTimes(1);
    expect(makeErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toEqual([expectedRequestAction, expectedErrorAction]);
  });

  test('should fetch data with specified url, method and content-type', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const makeActionMock = jest.fn().mockReturnValue(jest.fn());

    // Act
    const action = createAsyncAction({
      makeRequest: makeActionMock,
      makeSuccess: makeActionMock,
      makeError: makeActionMock,
      apiOptions: {
        baseUrl: 'test url',
        method: 'POST',
        contentType: 'test content type',
      },
    });

    await action(payload)(jest.fn(), jest.fn(), {});

    // Assert
    expect(fetchMock).toHaveBeenCalledWith('test url', {
      method: 'POST',
      headers: { 'Content-Type': 'test content type' },
    });
  });

  test('should fetch data with modified url, specified method and content-type', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const makeActionMock = jest.fn().mockReturnValue(jest.fn());
    const modifyUrlMock = jest.fn().mockReturnValue('test url (modified)');

    // Act
    const action = createAsyncAction({
      makeRequest: makeActionMock,
      makeSuccess: makeActionMock,
      makeError: makeActionMock,
      apiOptions: {
        baseUrl: 'test url',
        method: 'POST',
        contentType: 'test content type',
        modifyUrl: modifyUrlMock,
      },
    });

    await action(payload)(jest.fn(), jest.fn(), {});

    // Assert
    expect(modifyUrlMock).toHaveBeenCalledWith('test url', payload);
    expect(fetchMock).toHaveBeenCalledWith('test url (modified)', {
      method: 'POST',
      headers: { 'Content-Type': 'test content type' },
    });
  });

  test('should fetch data with specified url, method, content-type and constructed body', async () => {
    // Arrange
    const payload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const makeActionMock = jest.fn().mockReturnValue(jest.fn());
    const constructBodyMock = jest.fn().mockReturnValue(JSON.stringify(payload));

    // Act
    const action = createAsyncAction({
      makeRequest: makeActionMock,
      makeSuccess: makeActionMock,
      makeError: makeActionMock,
      apiOptions: {
        baseUrl: 'test url',
        method: 'POST',
        contentType: 'test content type',
        constructBody: constructBodyMock,
      },
    });

    await action(payload)(jest.fn(), jest.fn(), {});

    // Assert
    expect(fetchMock).toHaveBeenCalledWith('test url', {
      method: 'POST',
      headers: { 'Content-Type': 'test content type' },
      body: JSON.stringify(payload),
    });
    expect(constructBodyMock).toHaveBeenCalledWith(payload);
  });
});
