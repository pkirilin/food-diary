import { noteModel } from '@/entities/note';
import { type ManageNoteState, manageNoteSlice, initialState } from './manageNoteSlice';
import { type NoteFormValues } from './noteSchema';
import { type NoteRecognitionState, type Image } from './types';

const create = {
  state: ({ note }: Partial<ManageNoteState>): ManageNoteState => ({
    ...initialState,
    note,
  }),
  note: (): NoteFormValues => ({
    date: '2025-01-01',
    mealType: noteModel.MealType.Breakfast,
    displayOrder: 1,
    product: null,
    quantity: 120,
  }),
  image: (name: string): Image => ({
    name,
    base64: '...',
  }),
  noteRecognitionWithSuggestions: (...suggestedProducts: string[]): NoteRecognitionState => ({
    suggestions: suggestedProducts.map(name => ({
      product: {
        name,
        caloriesCost: 100,
        protein: null,
        fats: null,
        carbs: null,
        sugar: null,
        salt: null,
      },
      quantity: 100,
    })),
    isLoading: false,
  }),
} as const;

describe('selectors.activeScreen', () => {
  test('should show product-search screen when empty note draft created', () => {
    const manageNote = create.state({ note: create.note() });

    const activeScreen = manageNoteSlice.selectors.activeScreen({ manageNote });

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

    const givenState = create.state({
      note: create.note(),
      image: create.image('test.jpg'),
      noteRecognition: create.noteRecognitionWithSuggestions('test'),
    });

    const state = manageNoteSlice.reducer(givenState, action);

    expect(state.image).toBeUndefined();
    expect(state.noteRecognition.suggestions).toEqual([]);
    expect(state.noteRecognition.isLoading).toBe(false);
  });
});
