import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { noteApi } from '@/entities/note';
import { MealType } from '@/entities/note/model';
import { NotesList } from './NotesList';

test('I can add new note with existing product', async () => {
  const user = userEvent.setup();
  const store = configureStore();
  await store.dispatch(noteApi.endpoints.notes.initiate({ date: '2023-10-19' }));

  render(
    <RootProvider store={store}>
      <NotesList date="2023-10-19" mealType={MealType.Lunch} />
    </RootProvider>,
  );

  await user.click(screen.getByRole('button', { name: /add note/i }));
  expect(await screen.findByRole('dialog', { name: /new note/i })).toBeVisible();

  await user.type(screen.getByPlaceholderText(/search products/i), 'che');
  await user.click(await screen.findByRole('button', { name: /cheese/i }));
  expect(screen.getByRole('textbox', { name: /meal type/i })).toHaveValue('Lunch');
  expect(screen.getByRole('textbox', { name: /product/i })).toHaveValue('Cheese');

  await user.clear(screen.getByPlaceholderText(/quantity/i));
  await user.type(screen.getByPlaceholderText(/quantity/i), '120');
  await user.click(screen.getByRole('button', { name: /add/i }));
  await waitForElementToBeRemoved(screen.getByRole('dialog'));

  expect(screen.getByRole('button', { name: /cheese 120 g 482 kcal/i })).toBeVisible();
});
