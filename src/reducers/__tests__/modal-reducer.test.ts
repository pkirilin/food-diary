import { CloseModalAction, ModalActionTypes, OpenModalAction } from '../../action-types';
import { ModalBody, ModalOptions, ModalState } from '../../store';
import modalReducer, { initialState } from '../modal-reducer';

type CreateTestDataOptions = {
  body: ModalBody;
  options?: ModalOptions;
};

function createTestData({ body, options }: CreateTestDataOptions): [OpenModalAction, ModalState] {
  const action: OpenModalAction = {
    type: ModalActionTypes.Open,
    title: 'Modal title',
    body,
    options,
  };
  const expectedState: ModalState = {
    isOpened: true,
    title: action.title,
    body: action.body,
    options: options ?? { width: '80%' },
  };
  return [action, expectedState];
}

describe('modal reducer', () => {
  test('should handle open modal with specified options', () => {
    const [action, expectedState] = createTestData({
      body: 'Modal body text',
      options: {
        width: '50%',
      },
    });

    const nextState = modalReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle open modal with initial state options', () => {
    const [action, expectedState] = createTestData({
      body: 'Modal body text',
    });

    const nextState = modalReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle close modal', () => {
    const state: ModalState = {
      isOpened: true,
      title: 'Title',
      body: 'Body',
      options: {},
    };
    const action: CloseModalAction = { type: ModalActionTypes.Close };

    const nextState = modalReducer(state, action);

    expect(nextState).toMatchObject(initialState);
  });
});
