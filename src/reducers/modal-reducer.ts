import { ModalState } from '../store';
import { ModalActions, ModalActionTypes } from '../action-types';

const initialState: ModalState = {
  isOpened: false,
  title: '',
  body: '',
};

const modalReducer = (state: ModalState = initialState, action: ModalActions): ModalState => {
  switch (action.type) {
    case ModalActionTypes.Open:
      return {
        isOpened: true,
        title: action.title,
        body: action.body,
      };
    case ModalActionTypes.Close:
      return {
        isOpened: false,
        title: initialState.title,
        body: initialState.body,
      };
    default:
      return state;
  }
};

export default modalReducer;
