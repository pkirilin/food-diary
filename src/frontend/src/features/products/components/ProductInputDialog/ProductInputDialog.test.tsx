import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ProductFormData } from '../../types';
import ProductInputDialog from './ProductInputDialog';

test('should submit form on valid input', async () => {
  const user = userEvent.setup();
  const onSubmitMock = vi.fn();

  render(
    <ProductInputDialog
      isOpened={true}
      setIsOpened={vi.fn()}
      title="Test"
      submitText="Submit"
      onSubmit={onSubmitMock}
      isLoading={false}
      categories={[
        {
          id: 1,
          name: 'Test category',
        },
      ]}
      categoriesLoaded={true}
      categoriesLoading={false}
      onLoadCategories={vi.fn()}
    />,
  );

  const productName = screen.getByPlaceholderText(/product name/i);
  const caloriesCost = screen.getByPlaceholderText(/calories cost/i);
  const defaultQuantity = screen.getByPlaceholderText(/default quantity/i);
  const category = screen.getByPlaceholderText(/category/i);
  await user.type(productName, 'Test product');
  await user.clear(caloriesCost);
  await user.clear(defaultQuantity);
  await user.type(defaultQuantity, '50');
  await user.type(caloriesCost, '150');
  await user.click(category);
  await user.click(within(screen.getByRole('listbox')).getByText(/test category/i));
  await user.click(screen.getByRole('button', { name: /create test product/i }));

  expect(onSubmitMock).toHaveBeenCalledWith({
    name: 'Test product',
    caloriesCost: 150,
    defaultQuantity: 50,
    category: {
      id: 1,
      name: 'Test category',
    },
  } satisfies ProductFormData);
});
