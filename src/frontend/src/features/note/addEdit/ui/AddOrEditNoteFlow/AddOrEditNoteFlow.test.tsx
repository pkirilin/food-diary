import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { givenAddOrEditNoteFlow } from './AddOrEditNoteFlow.builder';
import * as steps from './AddOrEditNoteFlow.steps';

test('New product form is cleared after I change product to existing one', async () => {
  const user = userEvent.setup();

  render(
    givenAddOrEditNoteFlow()
      .withQuantity(100)
      .withProductForSelect({ name: 'Cucumber' })
      .withCategoriesForSelect('Vegetables')
      .please(),
  );

  await steps.whenDialogOpened(user);
  await steps.whenAddedNotExistingProductOption(user, 'Potato');
  await steps.whenProductCaloriesCostChanged(user, 120);
  await steps.whenProductDefaultQuantityChanged(user, 80);
  await steps.whenProductCategorySelected(user, /vegetables/i);
  await steps.whenProductAdded(user);
  await steps.thenNoteFormShouldBeVisible();

  await steps.whenProductSelected(user, /cucumber/i);
  await steps.whenProductCleared(user);
  await steps.whenAddedNotExistingProductOption(user, 'Carrot');
  await steps.thenProductFormShouldBeVisible();
  await steps.thenProductNameHasValue('Carrot');
  await steps.thenProductCaloriesCostHasValue(100);
  await steps.thenProductDefaultQuantityHasValue(100);
  await steps.thenProductCategoryIsEmpty();
});
