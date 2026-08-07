import { configureStore } from '@reduxjs/toolkit';
import { noteModel } from '@/entities/note';
import { imageUrlsListener } from './imageUrlsListener';
import { manageNoteSlice } from './manageNoteSlice';
import { type NoteFormValues, type NoteFormValuesProduct } from './noteSchema';
import { type Image } from './types';

const create = {
  image: (name: string): Image => ({
    id: crypto.randomUUID(),
    name,
    base64: `base64-${name}`,
    originalUrl: `blob:${name}`,
  }),
  note: (): NoteFormValues => ({
    date: '2025-01-01',
    mealType: noteModel.MealType.Breakfast,
    displayOrder: 1,
    product: null,
    quantity: 120,
  }),
  product: (): NoteFormValuesProduct => ({
    id: 1,
    name: 'test',
    defaultQuantity: 123,
    calories: 100,
    protein: null,
    fats: null,
    carbs: null,
    sugar: null,
    salt: null,
  }),
} as const;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createTestStore = () =>
  configureStore({
    reducer: {
      manageNote: manageNoteSlice.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().prepend(imageUrlsListener.middleware),
  });

afterEach(() => {
  vi.restoreAllMocks();
});

test('should revoke urls of all images when note draft discarded', () => {
  const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
  const store = createTestStore();
  const imageA = create.image('a.jpg');
  const imageB = create.image('b.jpg');

  store.dispatch(manageNoteSlice.actions.imagesUploaded([imageA, imageB]));
  store.dispatch(manageNoteSlice.actions.noteDraftDiscarded());

  expect(revokeObjectURL).toHaveBeenCalledWith(imageA.originalUrl);
  expect(revokeObjectURL).toHaveBeenCalledWith(imageB.originalUrl);
});

test('should revoke urls of replaced images only when images re-uploaded', () => {
  const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
  const store = createTestStore();
  const imageA = create.image('a.jpg');
  const imageB = create.image('b.jpg');
  const imageC = create.image('c.jpg');

  store.dispatch(manageNoteSlice.actions.imagesUploaded([imageA, imageB]));
  store.dispatch(manageNoteSlice.actions.imagesUploaded([imageC]));

  expect(revokeObjectURL).toHaveBeenCalledWith(imageA.originalUrl);
  expect(revokeObjectURL).toHaveBeenCalledWith(imageB.originalUrl);
  expect(revokeObjectURL).not.toHaveBeenCalledWith(imageC.originalUrl);
});

test('should revoke urls of all images when product draft saved', () => {
  const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
  const store = createTestStore();
  const image = create.image('a.jpg');

  store.dispatch(manageNoteSlice.actions.noteDraftCreated(create.note()));
  store.dispatch(manageNoteSlice.actions.imagesUploaded([image]));
  store.dispatch(manageNoteSlice.actions.productDraftSaved(create.product()));

  expect(revokeObjectURL).toHaveBeenCalledWith(image.originalUrl);
});
