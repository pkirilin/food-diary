import { NotesListActionTypes } from '../../../action-types';
import { ErrorAction, RequestAction, SuccessAction } from '../../../helpers';
import { MealType, NoteItem, NotesForMealSearchRequest, NotesSearchRequest } from '../../../models';
import { NotesListState } from '../../../store';
import notesListReducer, { initialState } from '../notes-list-reducer';

function generateTestNoteItem(mealType: MealType): NoteItem {
  return {
    id: 1,
    mealType,
    displayOrder: 0,
    productId: 1,
    productName: 'Test product',
    productQuantity: 125,
    calories: 450,
  };
}

function generateTestNoteItems(): NoteItem[] {
  return [
    generateTestNoteItem(MealType.Breakfast),
    generateTestNoteItem(MealType.SecondBreakfast),
    generateTestNoteItem(MealType.Lunch),
    generateTestNoteItem(MealType.Dinner),
  ];
}

describe('notes list reducer', () => {
  test('should handle notes for page request', () => {
    const action: RequestAction<NotesListActionTypes.RequestForPage, NotesSearchRequest> = {
      type: NotesListActionTypes.RequestForPage,
      requestMessage: 'Test',
      payload: { pageId: 1 },
    };
    const expectedState: NotesListState = {
      ...initialState,
      notesForPageFetchState: {
        loading: true,
        loaded: false,
        loadingMessage: 'Test',
      },
    };

    const nextState = notesListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle notes for page success', () => {
    const action: SuccessAction<NotesListActionTypes.SuccessForPage, NoteItem[], NotesSearchRequest> = {
      type: NotesListActionTypes.SuccessForPage,
      data: generateTestNoteItems(),
      payload: { pageId: 1 },
    };
    const expectedState: NotesListState = {
      ...initialState,
      noteItems: action.data,
      notesForPageFetchState: {
        loading: false,
        loaded: true,
      },
    };

    const nextState = notesListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle notes for page error', () => {
    const action: ErrorAction<NotesListActionTypes.ErrorForPage, NotesSearchRequest> = {
      type: NotesListActionTypes.ErrorForPage,
      errorMessage: 'Test',
      payload: { pageId: 1 },
    };
    const expectedState: NotesListState = {
      ...initialState,
      notesForPageFetchState: {
        loading: false,
        loaded: false,
        error: 'Test',
      },
    };

    const nextState = notesListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle notes for meal request', () => {
    const action: RequestAction<NotesListActionTypes.RequestForMeal, NotesForMealSearchRequest> = {
      type: NotesListActionTypes.RequestForMeal,
      requestMessage: 'Test',
      payload: {
        pageId: 1,
        mealType: MealType.Breakfast,
      },
    };
    const state: NotesListState = {
      ...initialState,
      notesForMealFetchStates: [
        {
          mealType: MealType.Breakfast,
          loading: false,
          loaded: false,
        },
        {
          mealType: MealType.Lunch,
          loading: false,
          loaded: false,
        },
      ],
    };
    const expectedState: NotesListState = {
      ...initialState,
      notesForMealFetchStates: [
        {
          mealType: MealType.Lunch,
          loading: false,
          loaded: false,
        },
        {
          mealType: MealType.Breakfast,
          loading: true,
          loaded: false,
          loadingMessage: 'Test',
        },
      ],
    };

    const nextState = notesListReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle notes for meal success', () => {
    const action: SuccessAction<NotesListActionTypes.SuccessForMeal, NoteItem[], NotesForMealSearchRequest> = {
      type: NotesListActionTypes.SuccessForMeal,
      payload: {
        pageId: 1,
        mealType: MealType.Lunch,
      },
      data: [generateTestNoteItem(MealType.Lunch)],
    };
    const state: NotesListState = {
      ...initialState,
      noteItems: generateTestNoteItems(),
      notesForMealFetchStates: [
        {
          mealType: MealType.Breakfast,
          loading: false,
          loaded: false,
        },
        {
          mealType: MealType.Lunch,
          loading: false,
          loaded: false,
        },
      ],
    };
    const expectedState: NotesListState = {
      ...initialState,
      noteItems: [
        generateTestNoteItem(MealType.Breakfast),
        generateTestNoteItem(MealType.SecondBreakfast),
        generateTestNoteItem(MealType.Lunch),
        generateTestNoteItem(MealType.Dinner),
      ],
      notesForMealFetchStates: [
        {
          mealType: MealType.Breakfast,
          loading: false,
          loaded: false,
        },
        {
          mealType: MealType.Lunch,
          loading: false,
          loaded: true,
        },
      ],
    };

    const nextState = notesListReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle notes for meal error', () => {
    const action: ErrorAction<NotesListActionTypes.ErrorForMeal, NotesForMealSearchRequest> = {
      type: NotesListActionTypes.ErrorForMeal,
      payload: {
        pageId: 1,
        mealType: MealType.Breakfast,
      },
      errorMessage: 'Test',
    };
    const state: NotesListState = {
      ...initialState,
      notesForMealFetchStates: [
        {
          mealType: MealType.Breakfast,
          loading: false,
          loaded: false,
        },
        {
          mealType: MealType.Lunch,
          loading: false,
          loaded: false,
        },
      ],
    };
    const expectedState: NotesListState = {
      ...initialState,
      notesForMealFetchStates: [
        {
          mealType: MealType.Lunch,
          loading: false,
          loaded: false,
        },
        {
          mealType: MealType.Breakfast,
          loading: false,
          loaded: false,
          error: 'Test',
        },
      ],
    };

    const nextState = notesListReducer(state, action);

    expect(nextState).toMatchObject(expectedState);
  });
});
