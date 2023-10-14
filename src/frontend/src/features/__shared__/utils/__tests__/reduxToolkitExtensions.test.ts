import { AnyAction, createAsyncThunk } from '@reduxjs/toolkit';
import configureStore from 'redux-mock-store';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { createApiCallAsyncThunk, createAsyncThunkMatcher } from '../reduxToolkitExtensions';

type TestRecord = {
  id: number;
  name: string;
  age: number;
};

type TestState = {
  records: TestRecord[];
};

type TestDispatch = ThunkDispatch<TestState, unknown, AnyAction>;

const fetchMock = vi.fn<unknown[], Promise<Response>>();
global.fetch = fetchMock;

const mockStore = configureStore<TestState, TestDispatch>([thunk]);
const store = mockStore();

describe('createApiCallAsyncThunk', () => {
  afterEach(() => {
    vi.clearAllMocks();
    store.clearActions();
  });

  describe('when created thunk is called', () => {
    test('should call api and get data', async () => {
      // Arrange
      const url = 'https://google.com';
      const arg = 1;
      const response: Response = { ...new Response(), ok: true };
      const body = 'test body';
      const getUrlMock = vi.fn().mockReturnValue(url);
      const getDataMock = vi.fn();
      const bodyCreatorMock = vi.fn().mockReturnValue(body);
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
      expect(getDataMock).toHaveBeenCalledWith(response, arg);
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
      const getDataMock = vi.fn().mockResolvedValue(records);
      fetchMock.mockResolvedValue({ ...new Response(), ok: true });

      // Act
      const thunk = createApiCallAsyncThunk<TestRecord[], number>('test', vi.fn(), getDataMock);
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
      const thunk = createApiCallAsyncThunk<void, number>('test', vi.fn(), vi.fn());
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
      const thunk = createApiCallAsyncThunk<void, number>('test', vi.fn(), vi.fn(), errorMessage);
      await store.dispatch(thunk(arg));
      const actions = store.getActions();

      // Assert
      expect(actions[0].type).toEqual('test/pending');
      expect(actions[1].type).toEqual('test/rejected');
      expect(actions[1].payload).toEqual(errorMessage);
    });
  });
});

describe('createAsyncThunkMatcher', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('when thunks array contains at least one with matching type', () => {
    test('should return true', () => {
      // Arrange
      const thunk1 = createAsyncThunk('thunk1', vi.fn<unknown[]>());
      const thunk2 = createAsyncThunk('thunk2', vi.fn<unknown[]>());
      const thunk3 = createAsyncThunk('thunk3', vi.fn<unknown[]>());

      // Act
      const matcher = createAsyncThunkMatcher([thunk1, thunk2, thunk3], 'pending');

      // Assert
      expect(matcher(thunk2.pending)).toBeTruthy();
    });
  });

  describe('when thunks array does not contain any with matching type', () => {
    test('should return false', () => {
      // Arrange
      const thunk1 = createAsyncThunk('thunk1', vi.fn<unknown[]>());
      const thunk2 = createAsyncThunk('thunk2', vi.fn<unknown[]>());
      const thunk3 = createAsyncThunk('thunk3', vi.fn<unknown[]>());

      // Act
      const matcher = createAsyncThunkMatcher([thunk1, thunk2, thunk3], 'fulfilled');

      // Assert
      expect(matcher(thunk3.rejected)).toBeFalsy();
    });
  });
});
