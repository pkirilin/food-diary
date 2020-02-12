import { connect } from 'react-redux';
import NoteInput from './NoteInput';
import { NoteCreateEdit } from '../../models';
import { CreateNoteSuccessAction, CreateNoteErrorAction } from '../../action-types';
import { createNote } from '../../action-creators';
import { ThunkDispatch } from 'redux-thunk';
import { FoodDiaryState } from '../../store';

export interface StateToPropsMapResult {
  isOperationInProcess: boolean;
}

export interface DispatchToPropsMapResult {
  createNote: (note: NoteCreateEdit) => Promise<CreateNoteSuccessAction | CreateNoteErrorAction>;
}

const mapStateToProps = (state: FoodDiaryState): StateToPropsMapResult => {
  return {
    isOperationInProcess: state.notes.operations.status.performing,
  };
};

type NoteInputDispatchType = ThunkDispatch<void, NoteCreateEdit, CreateNoteSuccessAction | CreateNoteErrorAction>;

const mapDispatchToProps = (dispatch: NoteInputDispatchType): DispatchToPropsMapResult => {
  return {
    createNote: (note: NoteCreateEdit): Promise<CreateNoteSuccessAction | CreateNoteErrorAction> => {
      return dispatch(createNote(note));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NoteInput);
