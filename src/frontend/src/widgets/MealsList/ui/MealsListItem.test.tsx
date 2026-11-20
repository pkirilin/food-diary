import userEvent from '@testing-library/user-event';
import { noteModel } from '@/entities/note';
import * as steps from './MealsListItem.steps';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('I can see my meals with calculated calories', async () => {
  steps.givenMealsListItem({ mealType: noteModel.MealType.Lunch });

  await steps.thenMealHeaderIsVisible();
  steps.thenMealsAreVisible();
});

test('I can see which meal and note are missing nutrition values', async () => {
  const user = userEvent.setup();

  steps.givenMealsListItem({ mealType: noteModel.MealType.SecondBreakfast });

  await steps.thenMealAndNoteMarkedAsMissingNutritionValues(/^milk/i, /^oats/i);

  await steps.whenNoteExpanded(user, /^milk/i);
  await steps.thenMissingNutritionValuesAlertVisible();
});

test('I can add new note with existing product', async () => {
  const user = userEvent.setup();

  steps.givenMealsListItem({ mealType: noteModel.MealType.Lunch });

  await steps.whenAddNoteButtonClicked(user, 'Lunch');
  await steps.thenDialogVisible(/lunch/i);
  steps.thenProductSearchFocused();
  steps.thenNoteCannotBeAdded();

  await steps.whenProductSearched(user, 'che');
  await steps.whenExistingProductSelected(user, /cheese/i);
  steps.thenProductHasValue('Cheese');
  steps.thenNoteCanBeAdded();

  await steps.whenQuantityChanged(user, 120);
  await steps.whenNoteAdded(user);
  await steps.thenDialogNotVisible();
  steps.thenSingleNoteVisible(/cheese 120 g nutrition values are missing 482/i);
});

test('I can add new note with adding new product "on the fly"', async () => {
  const user = userEvent.setup();

  steps.givenMealsListItem({ mealType: noteModel.MealType.Lunch });

  await steps.whenAddNoteButtonClicked(user, 'Lunch');
  await steps.thenDialogVisible(/lunch/i);

  await steps.whenProductSearched(user, 'Ora');
  await steps.whenProductAddedFromInput(user, 'Ora');
  await steps.thenDialogVisible(/product/i);
  steps.thenProductCategoryHasValue('Bakery');
  steps.thenProductCanBeAdded();

  await steps.whenProductNameCompleted(user, 'nge');
  await steps.whenProductCaloriesSet(user, 60);
  await steps.whenProductDefaultQuantitySet(user, 200);
  await steps.whenProductCategorySelected(user, /fruits/i);
  await steps.whenProductAdded(user);
  await steps.thenDialogVisible(/lunch/i);
  steps.thenProductHasValue('Orange');
  steps.thenQuantityHasValue('200');

  await steps.whenQuantityChanged(user, 250);
  await steps.whenNoteAdded(user);
  await steps.thenDialogNotVisible();
  steps.thenSingleNoteVisible(/orange 250 g nutrition values are missing 150/i);
});

test('I can change quantity for existing note', async () => {
  const user = userEvent.setup();

  steps.givenMealsListItem({ mealType: noteModel.MealType.Lunch });

  await steps.whenNoteExpanded(user, /cheese 200 g nutrition values are missing 804/i);
  await steps.whenEditNoteClicked(user);
  await steps.thenDialogVisible(/lunch/i);
  steps.thenProductHasValue('Cheese');
  steps.thenQuantityHasValue('200');

  await steps.whenQuantityChanged(user, 150);
  await steps.whenNoteSaved(user);
  await steps.thenDialogNotVisible();
  steps.thenSingleNoteVisible(/cheese 150 g nutrition values are missing 603/i);
});

test('I can edit product via note form', async () => {
  const user = userEvent.setup();

  steps.givenMealsListItem({ mealType: noteModel.MealType.Lunch });

  await steps.whenAddNoteButtonClicked(user, 'Lunch');
  await steps.thenDialogVisible(/lunch/i);

  await steps.whenProductSearched(user, 'che');
  await steps.whenExistingProductSelected(user, /cheese/i);
  await steps.whenProductEditClicked(user);
  await steps.thenDialogVisible(/product/i);
  steps.thenProductCategoryHasValue('Dairy');
  steps.thenProductCanBeSaved();

  await steps.whenProductNameEdited(user, 'Mozarella cheese');
  await steps.whenProductSaved(user);
  await steps.thenDialogVisible(/lunch/i);
  steps.thenProductHasValue('Mozarella cheese');
});

test.each([
  { storage: 'empty', prepareStorage: () => {} },
  {
    storage: 'throwing',
    prepareStorage: () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage is disabled');
      });
    },
  },
])(
  'with the "Log several foods at once" switch off and $storage device storage, Add breakfast opens the old dialog',
  async ({ prepareStorage }) => {
    prepareStorage();
    const user = userEvent.setup();
    steps.givenMealsListItem({ mealType: noteModel.MealType.Breakfast });

    await steps.whenAddNoteButtonClicked(user, 'Breakfast');

    await steps.thenDialogVisible(/breakfast/i);
  },
);
