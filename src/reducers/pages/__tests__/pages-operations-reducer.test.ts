import {
  CreatePageErrorAction,
  CreatePageRequestAction,
  CreatePageSuccessAction,
  DeletePagesErrorAction,
  DeletePagesRequestAction,
  DeletePagesSuccessAction,
  EditPageErrorAction,
  EditPageRequestAction,
  EditPageSuccessAction,
  ExportPagesErrorAction,
  ExportPagesRequestAction,
  ExportPagesSuccessAction,
  GetDateForNewPageErrorAction,
  GetDateForNewPageRequestAction,
  GetDateForNewPageSuccessAction,
  ImportPagesErrorAction,
  ImportPagesRequestAction,
  ImportPagesSuccessAction,
  PagesOperationsActionTypes,
} from '../../../action-types';
import { PagesOperationsState } from '../../../store';
import pagesOperationsReducer, { initialState } from '../pages-operations-reducer';

describe('pages operations reducer', () => {
  test('should handle create request', () => {
    const action: CreatePageRequestAction = {
      type: PagesOperationsActionTypes.CreateRequest,
      page: { date: '2020-10-07' },
      operationMessage: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: true,
        message: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle create success', () => {
    const action: CreatePageSuccessAction = {
      type: PagesOperationsActionTypes.CreateSuccess,
      createdPageId: 1,
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle create error', () => {
    const action: CreatePageErrorAction = {
      type: PagesOperationsActionTypes.CreateError,
      error: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit request', () => {
    const action: EditPageRequestAction = {
      type: PagesOperationsActionTypes.EditRequest,
      request: {
        id: 1,
        page: { date: '2020-10-07' },
      },
      operationMessage: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: true,
        message: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit success', () => {
    const action: EditPageSuccessAction = {
      type: PagesOperationsActionTypes.EditSuccess,
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle edit error', () => {
    const action: EditPageErrorAction = {
      type: PagesOperationsActionTypes.EditError,
      error: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete request', () => {
    const action: DeletePagesRequestAction = {
      type: PagesOperationsActionTypes.DeleteRequest,
      operationMessage: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: true,
        message: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete success', () => {
    const action: DeletePagesSuccessAction = {
      type: PagesOperationsActionTypes.DeleteSuccess,
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle delete error', () => {
    const action: DeletePagesErrorAction = {
      type: PagesOperationsActionTypes.DeleteError,
      error: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle export request', () => {
    const action: ExportPagesRequestAction = {
      type: PagesOperationsActionTypes.ExportRequest,
      operationMessage: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: true,
        message: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle export success', () => {
    const blob: Blob = new Blob();
    const action: ExportPagesSuccessAction = {
      type: PagesOperationsActionTypes.ExportSuccess,
      exportFile: blob,
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle export error', () => {
    const action: ExportPagesErrorAction = {
      type: PagesOperationsActionTypes.ExportError,
      error: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle import request', () => {
    const action: ImportPagesRequestAction = {
      type: PagesOperationsActionTypes.ImportRequest,
      operationMessage: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: true,
        message: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle import success', () => {
    const action: ImportPagesSuccessAction = {
      type: PagesOperationsActionTypes.ImportSuccess,
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle import error', () => {
    const action: ImportPagesErrorAction = {
      type: PagesOperationsActionTypes.ImportError,
      error: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle date for new page request', () => {
    const action: GetDateForNewPageRequestAction = {
      type: PagesOperationsActionTypes.DateForNewPageRequest,
      operationMessage: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: true,
        message: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle date for new page success', () => {
    const action: GetDateForNewPageSuccessAction = {
      type: PagesOperationsActionTypes.DateForNewPageSuccess,
      dateForNewPage: '2020-10-08',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle date for new page error', () => {
    const action: GetDateForNewPageErrorAction = {
      type: PagesOperationsActionTypes.DateForNewPageError,
      error: 'Test',
    };
    const expectedState: PagesOperationsState = {
      ...initialState,
      status: {
        performing: false,
        error: 'Test',
      },
    };

    const nextState = pagesOperationsReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
