import configureStore from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { ApiRequestBody, createAsyncAction, ErrorAction, RequestAction, SuccessAction } from '../createAsyncAction';

const mockStore = configureStore<TestRecordsState, GetTestRecordsDispatch & CreateTestRecordDispatch>([thunk]);
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

enum CreateTestRecordActionTypes {
  Request = 'CREATE_TEST_RECORD_REQUEST',
  Success = 'CREATE_TEST_RECORD_SUCCESS',
  Error = 'CREATE_TEST_RECORD_ERROR',
}

type GetTestRecordsRequestAction = RequestAction<GetTestRecordsActionTypes.Request, GetTestRecordsRequest>;
type GetTestRecordsSuccessAction = SuccessAction<GetTestRecordsActionTypes.Success, TestRecord[]>;
type GetTestRecordsErrorAction = ErrorAction<GetTestRecordsActionTypes.Error>;

type CreateTestRecordRequestAction = RequestAction<CreateTestRecordActionTypes.Request, TestRecord>;
type CreateTestRecordSuccessAction = SuccessAction<CreateTestRecordActionTypes.Success>;
type CreateTestRecordErrorAction = ErrorAction<CreateTestRecordActionTypes.Error>;

type GetTestRecordsActions = GetTestRecordsRequestAction | GetTestRecordsSuccessAction | GetTestRecordsErrorAction;
type CreateTestRecordActions =
  | CreateTestRecordRequestAction
  | CreateTestRecordSuccessAction
  | CreateTestRecordErrorAction;

type GetTestRecordsDispatch = ThunkDispatch<
  TestRecord[],
  GetTestRecordsRequest,
  GetTestRecordsSuccessAction | GetTestRecordsErrorAction
>;
type CreateTestRecordDispatch = ThunkDispatch<
  {},
  TestRecord,
  CreateTestRecordSuccessAction | CreateTestRecordErrorAction
>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function generateGetTestRecordsAsyncAction() {
  return createAsyncAction<
    GetTestRecordsRequestAction,
    GetTestRecordsSuccessAction,
    GetTestRecordsErrorAction,
    GetTestRecordsActionTypes.Request,
    GetTestRecordsActionTypes.Success,
    GetTestRecordsActionTypes.Error,
    TestRecord[],
    GetTestRecordsRequest
  >({
    makeRequest: () => {
      return (payload?: GetTestRecordsRequest): GetTestRecordsRequestAction => {
        if (!payload) {
          throw new Error('Failed to get test records: request payload is empty');
        }

        return {
          type: GetTestRecordsActionTypes.Request,
          requestMessage: 'Loading test records',
          payload,
        };
      };
    },
    makeSuccess: () => {
      return (data?: TestRecord[]): GetTestRecordsSuccessAction => ({
        type: GetTestRecordsActionTypes.Success,
        data: data ?? [],
      });
    },
    makeError: () => {
      return (errorMessage?: string): GetTestRecordsErrorAction => ({
        type: GetTestRecordsActionTypes.Error,
        errorMessage: errorMessage ?? '',
      });
    },
    apiOptions: {
      baseUrl: 'test url',
      onSuccess: async (dispatch, response): Promise<TestRecord[]> => {
        if (!response) {
          throw new Error('Failed to get test records: response is undefined');
        }

        const data = (await response.json()) as TestRecord[];
        return data;
      },
      onError: (): string => {
        return 'test error message';
      },
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function generateCreateTestRecordAsyncAction() {
  return createAsyncAction<
    CreateTestRecordRequestAction,
    CreateTestRecordSuccessAction,
    CreateTestRecordErrorAction,
    CreateTestRecordActionTypes.Request,
    CreateTestRecordActionTypes.Success,
    CreateTestRecordActionTypes.Error,
    {},
    TestRecord
  >({
    makeRequest: () => {
      return (payload?: TestRecord): CreateTestRecordRequestAction => {
        if (!payload) {
          throw new Error('Failed to create test record: payload is empty');
        }

        return {
          type: CreateTestRecordActionTypes.Request,
          requestMessage: 'Creating test record',
          payload,
        };
      };
    },
    makeSuccess: () => {
      return (): CreateTestRecordSuccessAction => ({
        type: CreateTestRecordActionTypes.Success,
        data: {},
      });
    },
    makeError: () => {
      return (errorMessage?: string): CreateTestRecordErrorAction => ({
        type: CreateTestRecordActionTypes.Error,
        errorMessage: errorMessage ?? '',
      });
    },
    apiOptions: {
      baseUrl: 'create test record base url',
      method: 'POST',
      modifyUrl: (baseUrl, payload): string => `${baseUrl} - (payload id = '${payload.id}')`,
      constructBody: (payload: TestRecord): ApiRequestBody => JSON.stringify(payload),
    },
  });
}

describe('createAsyncAction', () => {
  afterEach(() => {
    jest.clearAllMocks();
    store.clearActions();
  });

  test('should create async action which dispatches request and success actions, calls onSuccess callback and receives data if server response is ok', async () => {
    // Arrange
    const getTestRecords = generateGetTestRecordsAsyncAction();
    const requestPayload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
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
    const expectedActions: GetTestRecordsActions[] = [
      {
        type: GetTestRecordsActionTypes.Request,
        requestMessage: 'Loading test records',
        payload: requestPayload,
      },
      {
        type: GetTestRecordsActionTypes.Success,
        data: receivedRecords,
      },
    ];

    fetchMock.mockResolvedValue({
      ...new Response(),
      ok: true,
      json: jest.fn().mockResolvedValue(receivedRecords),
    });

    // Act
    await store.dispatch(getTestRecords(requestPayload));

    // Assert
    expect(store.getActions()).toEqual(expectedActions);
    expect(fetchMock).toHaveBeenCalledWith('test url', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('should create async action which dispatches request and error actions and calls onError callback if server response is not ok', async () => {
    // Arrange
    const getTestRecords = generateGetTestRecordsAsyncAction();
    const requestPayload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const expectedActions: GetTestRecordsActions[] = [
      {
        type: GetTestRecordsActionTypes.Request,
        requestMessage: 'Loading test records',
        payload: requestPayload,
      },
      {
        type: GetTestRecordsActionTypes.Error,
        errorMessage: 'test error message',
      },
    ];

    fetchMock.mockResolvedValue({
      ...new Response(),
      ok: false,
    });

    // Act
    await store.dispatch(getTestRecords(requestPayload));

    // Assert
    expect(store.getActions()).toEqual(expectedActions);
    expect(fetchMock).toHaveBeenCalledWith('test url', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('should create async action which dispatches request and error actions and calls onError callback if server response is rejected', async () => {
    // Arrange
    const getTestRecords = generateGetTestRecordsAsyncAction();
    const requestPayload: GetTestRecordsRequest = {
      filterByName: 'John',
      ageLimit: 40,
    };
    const expectedActions: GetTestRecordsActions[] = [
      {
        type: GetTestRecordsActionTypes.Request,
        requestMessage: 'Loading test records',
        payload: requestPayload,
      },
      {
        type: GetTestRecordsActionTypes.Error,
        errorMessage: 'test error message',
      },
    ];

    fetchMock.mockRejectedValue(new Response());

    // Act
    await store.dispatch(getTestRecords(requestPayload));

    // Assert
    expect(store.getActions()).toEqual(expectedActions);
    expect(fetchMock).toHaveBeenCalledWith('test url', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  test('should create async action which modifies base url by action parameter, POSTs test record and dispatches request and success actions if server response is ok', async () => {
    // Arrange
    const createTestRecord = generateCreateTestRecordAsyncAction();
    const record: TestRecord = {
      id: 1,
      name: 'Mike',
      age: 26,
    };
    const expectedActions: CreateTestRecordActions[] = [
      {
        type: CreateTestRecordActionTypes.Request,
        requestMessage: 'Creating test record',
        payload: record,
      },
      {
        type: CreateTestRecordActionTypes.Success,
        data: {},
      },
    ];

    fetchMock.mockResolvedValue({
      ...new Response(),
      ok: true,
    });

    // Act
    await store.dispatch(createTestRecord(record));

    // Assert
    expect(store.getActions()).toEqual(expectedActions);
    expect(fetchMock).toHaveBeenCalledWith("create test record base url - (payload id = '1')", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
  });
});
