import { ModalState } from '../store';
import { ModalActions, ModalActionTypes } from '../action-types';

export const initialState: ModalState = {
  isOpened: false,
  title: '',
  body: '',
  options: {
    width: '80%',
  },
};

const modalReducer = (state: ModalState = initialState, action: ModalActions): ModalState => {
  switch (action.type) {
    case ModalActionTypes.Open:
      return {
        isOpened: true,
        title: action.title,
        body: action.body,
        options: {
          ...initialState.options,
          ...action.options,
        },
      };
    case ModalActionTypes.Close:
      return initialState;
    default:
      return state;
  }
};

export default modalReducer;
