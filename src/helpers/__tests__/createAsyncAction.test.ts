import { ErrorAction, RequestAction, SuccessAction } from '../createAsyncAction';

enum TestActionTypes {
  Request = 'TEST_REQUEST',
  Success = 'TEST_SUCCESS',
  Error = 'TEST_ERROR',
}

type TestRequestAction = RequestAction<TestActionTypes.Request>;
type TestSuccessAction = SuccessAction<TestActionTypes.Success>;
type TestErrorAction = ErrorAction<TestActionTypes.Error>;

describe('createAsyncAction', () => {
  test('', () => {
    //
  });
});
