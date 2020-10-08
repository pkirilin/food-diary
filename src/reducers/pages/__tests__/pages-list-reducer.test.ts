import {
  GetPagesListErrorAction,
  GetPagesListRequestAction,
  GetPagesListSuccessAction,
  PagesListActionTypes,
  SetEditableForPagesAction,
  SetSelectedForAllPagesAction,
  SetSelectedForPageAction,
} from '../../../action-types';
import { PageItem } from '../../../models';
import { PagesListState } from '../../../store';
import pagesListReducer, { initialState } from '../pages-list-reducer';

function generateTestPages(): PageItem[] {
  return [
    {
      id: 1,
      date: '2020-10-05',
      countNotes: 0,
      countCalories: 0,
    },
    {
      id: 2,
      date: '2020-10-06',
      countNotes: 0,
      countCalories: 0,
    },
    {
      id: 3,
      date: '2020-10-07',
      countNotes: 0,
      countCalories: 0,
    },
  ];
}

describe('pages list reducer', () => {
  test('should handle pages request', () => {
    const action: GetPagesListRequestAction = {
      type: PagesListActionTypes.Request,
      loadingMessage: 'Test',
    };
    const expectedState: PagesListState = {
      ...initialState,
      pageItemsFetchState: {
        loading: true,
        loaded: false,
        loadingMessage: 'Test',
      },
    };

    const nextState = pagesListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle pages success', () => {
    const action: GetPagesListSuccessAction = {
      type: PagesListActionTypes.Success,
      pages: generateTestPages(),
    };
    const expectedState: PagesListState = {
      ...initialState,
      pageItems: action.pages,
      pageItemsFetchState: {
        loading: false,
        loaded: true,
      },
      selectedPagesIds: [],
    };

    const nextState = pagesListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle pages error', () => {
    const action: GetPagesListErrorAction = {
      type: PagesListActionTypes.Error,
      errorMessage: 'Test',
    };
    const expectedState: PagesListState = {
      ...initialState,
      pageItemsFetchState: {
        loading: false,
        loaded: false,
        error: 'Test',
      },
    };

    const nextState = pagesListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle selecting page', () => {
    const action: SetSelectedForPageAction = {
      type: PagesListActionTypes.SetSelected,
      selected: true,
      pageId: 4,
    };
    const state: PagesListState = {
      ...initialState,
      selectedPagesIds: [1, 2, 3],
    };
    const expectedState: PagesListState = {
      ...initialState,
      selectedPagesIds: [1, 2, 3, 4],
    };

    const nextState = pagesListReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle unselecting page', () => {
    const action: SetSelectedForPageAction = {
      type: PagesListActionTypes.SetSelected,
      selected: false,
      pageId: 2,
    };
    const state: PagesListState = {
      ...initialState,
      selectedPagesIds: [1, 2, 3],
    };
    const expectedState: PagesListState = {
      ...initialState,
      selectedPagesIds: [1, 3],
    };

    const nextState = pagesListReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle selecting all pages', () => {
    const action: SetSelectedForAllPagesAction = {
      type: PagesListActionTypes.SetSelectedAll,
      selected: true,
    };
    const state: PagesListState = {
      ...initialState,
      pageItems: generateTestPages(),
      selectedPagesIds: [1],
    };
    const expectedState: PagesListState = {
      ...state,
      selectedPagesIds: [1, 2, 3],
    };

    const nextState = pagesListReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle unselecting all pages', () => {
    const action: SetSelectedForAllPagesAction = {
      type: PagesListActionTypes.SetSelectedAll,
      selected: false,
    };
    const state: PagesListState = {
      ...initialState,
      pageItems: generateTestPages(),
      selectedPagesIds: [1, 2, 3],
    };
    const expectedState: PagesListState = {
      ...state,
      selectedPagesIds: [],
    };

    const nextState = pagesListReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle marking pages as editable', () => {
    const action: SetEditableForPagesAction = {
      type: PagesListActionTypes.SetEditable,
      pagesIds: [1, 2, 3],
      editable: true,
    };
    const state: PagesListState = {
      ...initialState,
      editablePagesIds: [3, 4],
    };
    const expectedState: PagesListState = {
      ...state,
      editablePagesIds: [3, 4, 1, 2, 3],
    };

    const nextState = pagesListReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle unmarking pages as editable', () => {
    const action: SetEditableForPagesAction = {
      type: PagesListActionTypes.SetEditable,
      pagesIds: [2, 4],
      editable: false,
    };
    const state: PagesListState = {
      ...initialState,
      editablePagesIds: [1, 2, 3, 4],
    };
    const expectedState: PagesListState = {
      ...state,
      editablePagesIds: [1, 3],
    };

    const nextState = pagesListReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
