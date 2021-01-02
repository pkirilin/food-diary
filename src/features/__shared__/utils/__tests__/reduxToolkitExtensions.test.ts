import { AnyAction } from '@reduxjs/toolkit';
import configureStore from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { createApiCallAsyncThunk } from '../reduxToolkitExtensions';

type TestRecord = {
  id: number;
  name: string;
  age: number;
};

type TestState = {
  records: TestRecord[];
};

type TestDispatch = ThunkDispatch<TestState, unknown, AnyAction>;

const fetchMock = jest.fn() as jest.Mock<Promise<Response>>;
global.fetch = fetchMock;

const mockStore = configureStore<TestState, TestDispatch>([thunk]);
const store = mockStore();

describe('createApiCallAsyncThunk', () => {
  afterEach(() => {
    jest.clearAllMocks();
    store.clearActions();
  });

  describe('when created thunk is called', () => {
    test('should call api and get data', async () => {
      // Arrange
      const url = 'https://google.com';
      const arg = 1;
      const response: Response = { ...new Response(), ok: true };
      const body = 'test body';
      const getUrlMock = jest.fn().mockReturnValue(url);
      const getDataMock = jest.fn();
      const bodyCreatorMock = jest.fn().mockReturnValue(body);
      fetchMock.mockResolvedValue(response);

      // Act
      const thunk = createApiCallAsyncThunk<void, number>('test', getUrlMock, getDataMock, '', {
        method: 'POST',
        bodyCreator: bodyCreatorMock,
      });
      await store.dispatch(thunk(arg));

      // Assert
      expect(getUrlMock).toHaveBeenCalledWith(arg);
      expect(fetchMock).toHaveBeenCalledWith(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
      expect(getDataMock).toHaveBeenCalledWith(response);
      expect(bodyCreatorMock).toHaveBeenCalledWith(arg);
    });
  });

  describe('when api response is successful', () => {
    test('should be resolved with received data', async () => {
      // Arrange
      const arg = 1;
      const records: TestRecord[] = [
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
      const getDataMock = jest.fn().mockResolvedValue(records);
      fetchMock.mockResolvedValue({ ...new Response(), ok: true });

      // Act
      const thunk = createApiCallAsyncThunk<TestRecord[], number>('test', jest.fn(), getDataMock);
      await store.dispatch(thunk(arg));
      const actions = store.getActions();

      // Assert
      expect(actions[0].type).toEqual('test/pending');
      expect(actions[1].type).toEqual('test/fulfilled');
      expect(actions[1].payload).toEqual(records);
    });
  });

  describe('when api response is not successful', () => {
    test('should be rejected with default error message', async () => {
      // Arrange
      const arg = 1;
      fetchMock.mockResolvedValue({ ...new Response(), ok: false });

      // Act
      const thunk = createApiCallAsyncThunk<void, number>('test', jest.fn(), jest.fn());
      await store.dispatch(thunk(arg));
      const actions = store.getActions();

      // Assert
      expect(actions[0].type).toEqual('test/pending');
      expect(actions[1].type).toEqual('test/rejected');
      expect(actions[1].payload).toEqual('Failed to fetch: response was not ok');
    });
  });

  describe('when api request is rejected', () => {
    test('should be rejected with error message', async () => {
      // Arrange
      const arg = 1;
      const errorMessage = 'test error message';
      fetchMock.mockRejectedValue({ ...new Response() });

      // Act
      const thunk = createApiCallAsyncThunk<void, number>(
        'test',
        jest.fn(),
        jest.fn(),
        errorMessage,
      );
      await store.dispatch(thunk(arg));
      const actions = store.getActions();

      // Assert
      expect(actions[0].type).toEqual('test/pending');
      expect(actions[1].type).toEqual('test/rejected');
      expect(actions[1].payload).toEqual(errorMessage);
    });
  });
});
