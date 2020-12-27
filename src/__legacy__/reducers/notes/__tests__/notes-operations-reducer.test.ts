import { NotesOperationsActionTypes } from '../../../action-types';
import { ErrorAction, RequestAction, SuccessAction } from '../../../helpers';
import { MealType, NoteCreateEdit, NoteDeleteRequest, NoteEditRequest } from '../../../models';
import { NotesOperationsState } from '../../../store';
import notesOperationsReducer from '../notes-operations-reducer';

describe('notes operations reducer', () => {
  test('should handle create request', () => {
    const action: RequestAction<NotesOperationsActionTypes.CreateRequest, NoteCreateEdit> = {
      type: NotesOperationsActionTypes.CreateRequest,
      payload: {
        mealType: MealType.Breakfast,
        productId: 1,
        pageId: 1,
        productQuantity: 100,
        displayOrder: 0,
      },
      requestMessage: 'Test',
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
    const action: SuccessAction<NotesOperationsActionTypes.CreateSuccess, {}, NoteCreateEdit> = {
      type: NotesOperationsActionTypes.CreateSuccess,
      data: {},
      payload: {
        mealType: MealType.Breakfast,
        productId: 1,
        pageId: 1,
        productQuantity: 100,
        displayOrder: 0,
      },
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
    const action: ErrorAction<NotesOperationsActionTypes.CreateError, NoteCreateEdit> = {
      type: NotesOperationsActionTypes.CreateError,
      errorMessage: 'Test',
      payload: {
        mealType: MealType.Breakfast,
        productId: 1,
        pageId: 1,
        productQuantity: 100,
        displayOrder: 0,
      },
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
    const action: RequestAction<NotesOperationsActionTypes.EditRequest, NoteEditRequest> = {
      type: NotesOperationsActionTypes.EditRequest,
      payload: {
        id: 1,
        note: {
          mealType: MealType.Breakfast,
          productId: 1,
          pageId: 1,
          productQuantity: 100,
          displayOrder: 0,
        },
      },
      requestMessage: 'Test',
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
    const action: SuccessAction<NotesOperationsActionTypes.EditSuccess, {}, NoteEditRequest> = {
      type: NotesOperationsActionTypes.EditSuccess,
      payload: {
        id: 1,
        note: {
          mealType: MealType.Breakfast,
          productId: 1,
          pageId: 1,
          productQuantity: 100,
          displayOrder: 0,
        },
      },
      data: {},
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
    const action: ErrorAction<NotesOperationsActionTypes.EditError, NoteEditRequest> = {
      type: NotesOperationsActionTypes.EditError,
      payload: {
        id: 1,
        note: {
          mealType: MealType.Breakfast,
          productId: 1,
          pageId: 1,
          productQuantity: 100,
          displayOrder: 0,
        },
      },
      errorMessage: 'Test',
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
    const action: RequestAction<NotesOperationsActionTypes.DeleteRequest, NoteDeleteRequest> = {
      type: NotesOperationsActionTypes.DeleteRequest,
      payload: {
        id: 1,
        mealType: MealType.Breakfast,
      },
      requestMessage: 'Test',
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
    const action: SuccessAction<NotesOperationsActionTypes.DeleteSuccess, {}, NoteDeleteRequest> = {
      type: NotesOperationsActionTypes.DeleteSuccess,
      payload: {
        id: 1,
        mealType: MealType.Breakfast,
      },
      data: {},
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
    const action: ErrorAction<NotesOperationsActionTypes.DeleteError, NoteDeleteRequest> = {
      type: NotesOperationsActionTypes.DeleteError,
      payload: {
        id: 1,
        mealType: MealType.Breakfast,
      },
      errorMessage: 'Test',
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
