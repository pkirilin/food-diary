import { noteModel } from '@/entities/note';
import { type ManageNoteState, manageNoteSlice, initialState } from './manageNoteSlice';

describe('selectors.activeScreen', () => {
  test('should show product-search screen when empty note draft created', () => {
    const activeScreen = manageNoteSlice.selectors.activeScreen({
      manageNote: {
        ...initialState,
        note: {
          date: '2025-01-01',
          mealType: noteModel.MealType.Breakfast,
          displayOrder: 1,
          product: null,
          quantity: 120,
        },
      },
    });

    expect(activeScreen.type).toBe('product-search');
  });
});

describe('actions.productDraftSaved', () => {
  test('should reset image and recognizeNote state', () => {
    const action = manageNoteSlice.actions.productDraftSaved({
      id: 1,
      name: 'test',
      defaultQuantity: 123,
    });

    const givenState: ManageNoteState = {
      ...initialState,
      note: {
        id: 1,
        date: '2025-01-01',
        mealType: noteModel.MealType.Breakfast,
        displayOrder: 1,
        product: null,
        quantity: 120,
      },
      image: {
        base64: '...',
        name: 'test.jpg',
      },
      noteRecognition: {
        suggestions: [
          {
            product: {
              name: 'test',
              caloriesCost: 100,
            },
            quantity: 100,
          },
        ],
        isLoading: false,
      },
    };

    const state = manageNoteSlice.reducer(givenState, action);

    expect(state.image).toBeUndefined();
    expect(state.noteRecognition.suggestions).toEqual([]);
    expect(state.noteRecognition.isLoading).toBe(false);
  });
});
