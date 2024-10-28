import { configureStore } from '@/app/store';
import { noteApi } from '../api';

test('should group api notes by meal types', async () => {
  const store = configureStore();
  const response = await store.dispatch(noteApi.endpoints.notes.initiate({ date: '2023-10-19' }));
  const notesFromApi = response.data?.notes ?? [];
  const notesFromStore = Object.values(store.getState().notes.byMealType).flat();

  expect(notesFromApi).toHaveLength(notesFromStore.length);
});
