import { PagesOperationsActionTypes } from '../../../action-types';
import { ErrorAction, RequestAction, SuccessAction } from '../../../helpers';
import { ExportFormat, PageCreateEdit, PageEditRequest, PagesExportRequest } from '../../../models';
import { PagesOperationsState } from '../../../store';
import pagesOperationsReducer, { initialState } from '../pages-operations-reducer';

describe('pages operations reducer', () => {
  test('should handle create request', () => {
    const action: RequestAction<PagesOperationsActionTypes.CreateRequest, PageCreateEdit> = {
      type: PagesOperationsActionTypes.CreateRequest,
      payload: { date: '2020-10-07' },
      requestMessage: 'Test',
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
    const action: SuccessAction<PagesOperationsActionTypes.CreateSuccess, number, PageCreateEdit> = {
      type: PagesOperationsActionTypes.CreateSuccess,
      data: 1,
      payload: { date: '2020-10-07' },
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
    const action: ErrorAction<PagesOperationsActionTypes.CreateError, PageCreateEdit> = {
      type: PagesOperationsActionTypes.CreateError,
      errorMessage: 'Test',
      payload: { date: '2020-10-07' },
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
    const action: RequestAction<PagesOperationsActionTypes.EditRequest, PageEditRequest> = {
      type: PagesOperationsActionTypes.EditRequest,
      payload: {
        id: 1,
        page: { date: '2020-10-07' },
      },
      requestMessage: 'Test',
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
    const action: SuccessAction<PagesOperationsActionTypes.EditSuccess, {}, PageEditRequest> = {
      type: PagesOperationsActionTypes.EditSuccess,
      data: {},
      payload: {
        id: 1,
        page: { date: '2020-10-07' },
      },
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
    const action: ErrorAction<PagesOperationsActionTypes.EditError, PageEditRequest> = {
      type: PagesOperationsActionTypes.EditError,
      errorMessage: 'Test',
      payload: {
        id: 1,
        page: { date: '2020-10-07' },
      },
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
    const action: RequestAction<PagesOperationsActionTypes.DeleteRequest, number[]> = {
      type: PagesOperationsActionTypes.DeleteRequest,
      requestMessage: 'Test',
      payload: [1, 2, 3],
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
    const action: SuccessAction<PagesOperationsActionTypes.DeleteSuccess, {}, number[]> = {
      type: PagesOperationsActionTypes.DeleteSuccess,
      data: {},
      payload: [1, 2, 3],
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
    const action: ErrorAction<PagesOperationsActionTypes.DeleteError, number[]> = {
      type: PagesOperationsActionTypes.DeleteError,
      errorMessage: 'Test',
      payload: [1, 2, 3],
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
    const action: RequestAction<PagesOperationsActionTypes.ExportRequest, PagesExportRequest> = {
      type: PagesOperationsActionTypes.ExportRequest,
      requestMessage: 'Test',
      payload: {
        startDate: '2020-11-12',
        endDate: '2020-11-15',
        format: ExportFormat.Json,
      },
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
    const action: SuccessAction<PagesOperationsActionTypes.ExportSuccess, Blob, PagesExportRequest> = {
      type: PagesOperationsActionTypes.ExportSuccess,
      data: blob,
      payload: {
        startDate: '2020-11-12',
        endDate: '2020-11-15',
        format: ExportFormat.Json,
      },
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
    const action: ErrorAction<PagesOperationsActionTypes.ExportError, PagesExportRequest> = {
      type: PagesOperationsActionTypes.ExportError,
      errorMessage: 'Test',
      payload: {
        startDate: '2020-11-12',
        endDate: '2020-11-15',
        format: ExportFormat.Json,
      },
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
    const action: RequestAction<PagesOperationsActionTypes.ImportRequest, File> = {
      type: PagesOperationsActionTypes.ImportRequest,
      requestMessage: 'Test',
      payload: new File([], 'test'),
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
    const action: SuccessAction<PagesOperationsActionTypes.ImportSuccess, {}, File> = {
      type: PagesOperationsActionTypes.ImportSuccess,
      data: {},
      payload: new File([], 'test'),
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
    const action: ErrorAction<PagesOperationsActionTypes.ImportError, File> = {
      type: PagesOperationsActionTypes.ImportError,
      errorMessage: 'Test',
      payload: new File([], 'test'),
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
    const action: RequestAction<PagesOperationsActionTypes.DateForNewPageRequest> = {
      type: PagesOperationsActionTypes.DateForNewPageRequest,
      requestMessage: 'Test',
      payload: {},
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
    const action: SuccessAction<PagesOperationsActionTypes.DateForNewPageSuccess, string> = {
      type: PagesOperationsActionTypes.DateForNewPageSuccess,
      data: '2020-10-08',
      payload: {},
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
    const action: ErrorAction<PagesOperationsActionTypes.DateForNewPageError> = {
      type: PagesOperationsActionTypes.DateForNewPageError,
      errorMessage: 'Test',
      payload: {},
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
