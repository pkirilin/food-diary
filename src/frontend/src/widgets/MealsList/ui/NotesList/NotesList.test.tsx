import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { noteApi } from '@/entities/note';
import { MealType } from '@/entities/note/model';
import { NotesList } from './NotesList';
import * as steps from './NotesList.steps';

test('I can add new note with existing product', async () => {
  const user = userEvent.setup();
  const store = configureStore();

  render(
    <RootProvider store={store}>
      <NotesList date="2023-10-19" mealType={MealType.Lunch} />
    </RootProvider>,
  );

  await steps.whenAddNoteButtonClicked(user);
  await steps.thenDialogVisible(/lunch/i);

  await steps.whenProductSearched(user, 'che');
  await steps.whenExistingProductSelected(user, /cheese/i);
  steps.thenProductHasValue('Cheese');

  await steps.whenQuantityChanged(user, 120);
  await steps.whenNoteAdded(user);
  await steps.thenDialogNotVisible();
  steps.thenSingleNoteVisible(/cheese 120 g 482 kcal/i);
});

test('I can add new note with adding new product "on the fly"', async () => {
  const user = userEvent.setup();
  const store = configureStore();
  await store.dispatch(noteApi.endpoints.notes.initiate({ date: '2023-10-19' }));

  render(
    <RootProvider store={store}>
      <NotesList date="2023-10-19" mealType={MealType.Lunch} />
    </RootProvider>,
  );

  await steps.whenAddNoteButtonClicked(user);
  await steps.thenDialogVisible(/lunch/i);

  await steps.whenProductSearched(user, 'Ora');
  await steps.whenProductAddedFromInput(user, 'Ora');
  await steps.thenDialogVisible(/new product/i);

  await steps.whenProductNameCompleted(user, 'nge');
  await steps.whenProductCaloriesCostSet(user, 60);
  await steps.whenProductDefaultQuantitySet(user, 200);
  await steps.whenProductCategorySelected(user, /fruits/i);
  await steps.whenProductAdded(user);
  await steps.thenDialogVisible(/lunch/i);
  steps.thenProductHasValue('Orange');
  steps.thenQuantityHasValue('200');

  await steps.whenQuantityChanged(user, 250);
  await steps.whenNoteAdded(user);
  await steps.thenDialogNotVisible();
  steps.thenSingleNoteVisible(/orange 250 g 150 kcal/i);
});

test('I can change quantity for existing note', async () => {
  const user = userEvent.setup();
  const store = configureStore();
  await store.dispatch(noteApi.endpoints.notes.initiate({ date: '2023-10-19' }));

  render(
    <RootProvider store={store}>
      <NotesList date="2023-10-19" mealType={MealType.Lunch} />
    </RootProvider>,
  );

  await steps.whenNoteClicked(user, /cheese 200 g 804 kcal/i);
  await steps.thenDialogVisible(/lunch/i);
  steps.thenProductHasValue('Cheese');
  steps.thenQuantityHasValue('200');

  await steps.whenQuantityChanged(user, 150);
  await steps.whenNoteSaved(user);
  await steps.thenDialogNotVisible();
  steps.thenSingleNoteVisible(/cheese 150 g 603 kcal/i);
});
