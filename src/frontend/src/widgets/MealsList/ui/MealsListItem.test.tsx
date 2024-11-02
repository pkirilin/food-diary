import { render, screen } from '@testing-library/react';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { noteApi, noteModel } from '@/entities/note';
import { MealsListItem } from './MealsListItem';

test('I can see my meals with calculated calories', async () => {
  const store = configureStore();
  await store.dispatch(noteApi.endpoints.notes.initiate({ date: '2023-10-19' }));

  render(
    <RootProvider store={store}>
      <MealsListItem date="2023-10-19" mealType={noteModel.MealType.Lunch} />
    </RootProvider>,
  );

  expect(screen.getByRole('listitem', { name: /lunch, [1-9][0-9]* kilocalories/i })).toBeVisible();
  expect(screen.getAllByRole('listitem').length).toBeGreaterThan(1);
  expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
});
