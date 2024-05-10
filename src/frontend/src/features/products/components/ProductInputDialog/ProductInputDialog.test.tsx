import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  expectCategory,
  givenProductInputDialog,
  thenFormValueContains,
  whenCaloriesCostChanged,
  whenCategorySelected,
  whenDefaultQuantityChanged,
  whenDialogOpened,
  whenProductNameChanged,
  whenProductSaved,
} from './ProductInputDialog.fixture';

describe('when input is valid', () => {
  test('should submit form', async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();

    render(
      givenProductInputDialog()
        .withOnSubmitMock(onSubmitMock)
        .withCategoriesForSelect('Fruits', 'Vegetables')
        .please(),
    );

    await whenDialogOpened(user);
    await whenProductNameChanged(user, 'Potato');
    await whenCaloriesCostChanged(user, '150');
    await whenDefaultQuantityChanged(user, '120');
    await whenCategorySelected(user, /vegetables/i);
    await whenProductSaved(user);
    await thenFormValueContains(onSubmitMock, {
      name: 'Potato',
      caloriesCost: 150,
      defaultQuantity: 120,
      category: expectCategory('Vegetables'),
    });
  });
});
