import {
  GetNotesForMealErrorAction,
  GetNotesForMealRequestAction,
  GetNotesForMealSuccessAction,
  GetNotesForPageErrorAction,
  GetNotesForPageRequestAction,
  GetNotesForPageSuccessAction,
  NotesListActionTypes,
} from '../../../action-types';
import { MealType, NoteItem } from '../../../models';
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
    const action: GetNotesForPageRequestAction = {
      type: NotesListActionTypes.RequestForPage,
      loadingMessage: 'Test',
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
    const action: GetNotesForPageSuccessAction = {
      type: NotesListActionTypes.SuccessForPage,
      noteItems: generateTestNoteItems(),
    };
    const expectedState: NotesListState = {
      ...initialState,
      noteItems: action.noteItems,
      notesForPageFetchState: {
        loading: false,
        loaded: true,
      },
    };

    const nextState = notesListReducer(initialState, action);

    expect(nextState).toMatchObject(expectedState);
  });

  test('should handle notes for page error', () => {
    const action: GetNotesForPageErrorAction = {
      type: NotesListActionTypes.ErrorForPage,
      errorMessage: 'Test',
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
    const action: GetNotesForMealRequestAction = {
      type: NotesListActionTypes.RequestForMeal,
      mealType: MealType.Breakfast,
      loadingMessage: 'Test',
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
    const action: GetNotesForMealSuccessAction = {
      type: NotesListActionTypes.SuccessForMeal,
      mealType: MealType.Lunch,
      noteItems: [generateTestNoteItem(MealType.Lunch)],
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
    const action: GetNotesForMealErrorAction = {
      type: NotesListActionTypes.ErrorForMeal,
      mealType: MealType.Breakfast,
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
