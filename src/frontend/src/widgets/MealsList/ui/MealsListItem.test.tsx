import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { noteModel } from '@/entities/note';
import * as steps from './MealsListItem.steps';

test('I can see my meals with calculated calories', async () => {
  await steps.givenMealsListItem({ mealType: noteModel.MealType.Lunch });

  expect(
    await screen.findByRole('listitem', { name: /lunch, [1-9][0-9]* kilocalories/i }),
  ).toBeVisible();
  expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
});

test('I can add new note with existing product', async () => {
  const user = userEvent.setup();

  await steps.givenMealsListItem({ mealType: noteModel.MealType.Lunch });

  await steps.whenAddNoteButtonClicked(user);
  await steps.thenDialogVisible(/lunch/i);
  await steps.thenNoteCannotBeAdded();

  await steps.whenProductSearched(user, 'che');
  await steps.whenExistingProductSelected(user, /cheese/i);
  await steps.thenProductHasValue('Cheese');
  await steps.thenNoteCanBeAdded();

  await steps.whenQuantityChanged(user, 120);
  await steps.whenNoteAdded(user);
  await steps.thenDialogNotVisible();
  await steps.thenSingleNoteVisible(/cheese 120 g 482 kcal/i);
});

test('I can add new note with adding new product "on the fly"', async () => {
  const user = userEvent.setup();

  await steps.givenMealsListItem({ mealType: noteModel.MealType.Lunch });

  await steps.whenAddNoteButtonClicked(user);
  await steps.thenDialogVisible(/lunch/i);

  await steps.whenProductSearched(user, 'Ora');
  await steps.whenProductAddedFromInput(user, 'Ora');
  await steps.thenDialogVisible(/product/i);
  await steps.thenProductCanBeAdded();

  await steps.whenProductNameCompleted(user, 'nge');
  await steps.whenProductCaloriesSet(user, 60);
  await steps.whenProductDefaultQuantitySet(user, 200);
  await steps.whenProductCategorySelected(user, /fruits/i);
  await steps.whenProductAdded(user);
  await steps.thenDialogVisible(/lunch/i);
  await steps.thenProductHasValue('Orange');
  steps.thenQuantityHasValue('200');

  await steps.whenQuantityChanged(user, 250);
  await steps.whenNoteAdded(user);
  await steps.thenDialogNotVisible();
  await steps.thenSingleNoteVisible(/orange 250 g 150 kcal/i);
});

test('I can change quantity for existing note', async () => {
  const user = userEvent.setup();

  await steps.givenMealsListItem({ mealType: noteModel.MealType.Lunch });

  await steps.whenNoteExpanded(user, /cheese 200 g 804 kcal/i);
  await steps.whenEditNoteClicked(user);
  await steps.thenDialogVisible(/lunch/i);
  await steps.thenProductHasValue('Cheese');
  steps.thenQuantityHasValue('200');

  await steps.whenQuantityChanged(user, 150);
  await steps.whenNoteSaved(user);
  await steps.thenDialogNotVisible();
  await steps.thenSingleNoteVisible(/cheese 150 g 603 kcal/i);
});

test('I can edit product via note form', async () => {
  const user = userEvent.setup();

  await steps.givenMealsListItem({ mealType: noteModel.MealType.Lunch });

  await steps.whenAddNoteButtonClicked(user);
  await steps.thenDialogVisible(/lunch/i);

  await steps.whenProductSearched(user, 'che');
  await steps.whenExistingProductSelected(user, /cheese/i);
  await steps.whenProductEditClicked(user);
  await steps.thenDialogVisible(/product/i);
  await steps.thenProductCanBeSaved();

  await steps.whenProductNameEdited(user, 'Mozarella cheese');
  await steps.whenProductSaved(user);
  await steps.thenDialogVisible(/lunch/i);
  await steps.thenProductHasValue('Mozarella cheese');
});
