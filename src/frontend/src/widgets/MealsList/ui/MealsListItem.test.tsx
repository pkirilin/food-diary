import { screen } from '@testing-library/react';
import { noteModel } from '@/entities/note';
import * as steps from './MealsListItem.steps';

test('I can see my meals with calculated calories', async () => {
  await steps.givenMealsListItem({
    mealType: noteModel.MealType.Lunch,
    preloadNotes: true,
  });

  expect(
    await screen.findByRole('listitem', { name: /lunch, [1-9][0-9]* kilocalories/i }),
  ).toBeVisible();
  expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
});
