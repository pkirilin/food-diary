import {
  CreateNoteErrorAction,
  CreateNoteRequestAction,
  CreateNoteSuccessAction,
  DeleteNoteErrorAction,
  DeleteNoteRequestAction,
  DeleteNoteSuccessAction,
  EditNoteErrorAction,
  EditNoteRequestAction,
  EditNoteSuccessAction,
  NotesOperationsActionTypes,
} from '../../../action-types';
import { MealType } from '../../../models';
import { NotesOperationsState } from '../../../store';
import notesOperationsReducer from '../notes-operations-reducer';

describe('notes operations reducer', () => {
  test('should handle create request', () => {
    const action: CreateNoteRequestAction = {
      type: NotesOperationsActionTypes.CreateRequest,
      note: {
        mealType: MealType.Breakfast,
        productId: 1,
        pageId: 1,
        productQuantity: 100,
        displayOrder: 0,
      },
      operationMessage: 'Test',
    };
    const state: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Breakfast,
          performing: false,
        },
        {
          mealType: MealType.Lunch,
          performing: false,
        },
      ],
    };
    const expectedState: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Lunch,
          performing: false,
        },
        {
          mealType: MealType.Breakfast,
          performing: true,
          message: 'Test',
        },
      ],
    };

    const nextState = notesOperationsReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle create success', () => {
    const action: CreateNoteSuccessAction = {
      type: NotesOperationsActionTypes.CreateSuccess,
      mealType: MealType.Breakfast,
    };
    const state: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Breakfast,
          performing: true,
        },
        {
          mealType: MealType.Lunch,
          performing: false,
        },
      ],
    };
    const expectedState: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Lunch,
          performing: false,
        },
        {
          mealType: MealType.Breakfast,
          performing: false,
        },
      ],
    };

    const nextState = notesOperationsReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle create error', () => {
    const action: CreateNoteErrorAction = {
      type: NotesOperationsActionTypes.CreateError,
      mealType: MealType.Breakfast,
      error: 'Test',
    };
    const state: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Breakfast,
          performing: true,
        },
        {
          mealType: MealType.Lunch,
          performing: false,
        },
      ],
    };
    const expectedState: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Lunch,
          performing: false,
        },
        {
          mealType: MealType.Breakfast,
          performing: false,
          error: 'Test',
        },
      ],
    };

    const nextState = notesOperationsReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit request', () => {
    const action: EditNoteRequestAction = {
      type: NotesOperationsActionTypes.EditRequest,
      request: {
        id: 1,
        note: {
          mealType: MealType.Breakfast,
          productId: 1,
          pageId: 1,
          productQuantity: 100,
          displayOrder: 0,
        },
      },
      operationMessage: 'Test',
    };
    const state: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Breakfast,
          performing: false,
        },
        {
          mealType: MealType.Lunch,
          performing: false,
        },
      ],
    };
    const expectedState: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Lunch,
          performing: false,
        },
        {
          mealType: MealType.Breakfast,
          performing: true,
          message: 'Test',
        },
      ],
    };

    const nextState = notesOperationsReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit success', () => {
    const action: EditNoteSuccessAction = {
      type: NotesOperationsActionTypes.EditSuccess,
      mealType: MealType.Breakfast,
    };
    const state: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Breakfast,
          performing: true,
        },
        {
          mealType: MealType.Lunch,
          performing: false,
        },
      ],
    };
    const expectedState: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Lunch,
          performing: false,
        },
        {
          mealType: MealType.Breakfast,
          performing: false,
        },
      ],
    };

    const nextState = notesOperationsReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit error', () => {
    const action: EditNoteErrorAction = {
      type: NotesOperationsActionTypes.EditError,
      mealType: MealType.Breakfast,
      error: 'Test',
    };
    const state: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Breakfast,
          performing: true,
        },
        {
          mealType: MealType.Lunch,
          performing: false,
        },
      ],
    };
    const expectedState: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Lunch,
          performing: false,
        },
        {
          mealType: MealType.Breakfast,
          performing: false,
          error: 'Test',
        },
      ],
    };

    const nextState = notesOperationsReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete request', () => {
    const action: DeleteNoteRequestAction = {
      type: NotesOperationsActionTypes.DeleteRequest,
      request: {
        id: 1,
        mealType: MealType.Breakfast,
      },
      operationMessage: 'Test',
    };
    const state: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Breakfast,
          performing: false,
        },
        {
          mealType: MealType.Lunch,
          performing: false,
        },
      ],
    };
    const expectedState: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Lunch,
          performing: false,
        },
        {
          mealType: MealType.Breakfast,
          performing: true,
          message: 'Test',
        },
      ],
    };

    const nextState = notesOperationsReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete success', () => {
    const action: DeleteNoteSuccessAction = {
      type: NotesOperationsActionTypes.DeleteSuccess,
      mealType: MealType.Breakfast,
    };
    const state: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Breakfast,
          performing: true,
        },
        {
          mealType: MealType.Lunch,
          performing: false,
        },
      ],
    };
    const expectedState: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Lunch,
          performing: false,
        },
        {
          mealType: MealType.Breakfast,
          performing: false,
        },
      ],
    };

    const nextState = notesOperationsReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete error', () => {
    const action: DeleteNoteErrorAction = {
      type: NotesOperationsActionTypes.DeleteError,
      mealType: MealType.Breakfast,
      error: 'Test',
    };
    const state: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Breakfast,
          performing: true,
        },
        {
          mealType: MealType.Lunch,
          performing: false,
        },
      ],
    };
    const expectedState: NotesOperationsState = {
      mealOperationStatuses: [
        {
          mealType: MealType.Lunch,
          performing: false,
        },
        {
          mealType: MealType.Breakfast,
          performing: false,
          error: 'Test',
        },
      ],
    };

    const nextState = notesOperationsReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
