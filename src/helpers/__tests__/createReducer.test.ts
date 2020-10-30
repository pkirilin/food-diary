import { Action, Reducer } from 'redux';
import { createReducer } from '../createReducer';

type TestState = {
  message: string;
  status: number;
};

const initialState: TestState = {
  message: 'Initial message',
  status: 0,
};

enum TestActionTypes {
  Ping = 'PING',
  Pong = 'PONG',
}

interface PingAction extends Action<TestActionTypes.Ping> {
  message: string;
  status: number;
}

type PongAction = Action<TestActionTypes.Pong>;

type TestActions = PingAction | PongAction;

const ping = (message: string, status: number): PingAction => ({
  type: TestActionTypes.Ping,
  message,
  status,
});

const pong = (): PongAction => ({
  type: TestActionTypes.Pong,
});

function createTestReducer(initialState: TestState): Reducer<TestState, TestActions> {
  return createReducer<TestState, TestActions>(initialState)
    .handle<PingAction>(TestActionTypes.Ping, (state, action) => ({
      message: action.message,
      status: action.status,
    }))
    .handle<PongAction>(TestActionTypes.Pong, () => ({
      message: 'pong',
      status: -1,
    }))
    .build();
}

describe('createReducer', () => {
  test('should create reducer which returns current state if unknown action type is provided', () => {
    // Arrange
    const currentState: TestState = {
      message: 'current',
      status: 10,
    };
    const action: Action = { type: 'TEST' };

    // Act
    const reducer = createTestReducer(initialState);
    const state = reducer(currentState, action);

    // Assert
    expect(state).toEqual(currentState);
  });

  test('should create reducer which returns state modified by action with parameters', () => {
    // Arrange
    const action = ping('ping', 1);
    const expectedState: TestState = {
      message: 'ping',
      status: 1,
    };

    // Act
    const reducer = createTestReducer(initialState);
    const state = reducer(initialState, action);

    // Assert
    expect(state).toEqual(expectedState);
  });

  test('should create reducer which returns state modified by action without parameters', () => {
    // Arrange
    const action = pong();
    const expectedState: TestState = {
      message: 'pong',
      status: -1,
    };

    // Act
    const reducer = createTestReducer(initialState);
    const state = reducer(initialState, action);

    // Assert
    expect(state).toEqual(expectedState);
  });

  test('should pass duplicate handler function', () => {
    createReducer(initialState)
      .handle<PingAction>(TestActionTypes.Ping, state => state)
      .handle<PingAction>(TestActionTypes.Ping, () => ({
        message: 'test',
        status: 1,
      }))
      .build();
  });
});
