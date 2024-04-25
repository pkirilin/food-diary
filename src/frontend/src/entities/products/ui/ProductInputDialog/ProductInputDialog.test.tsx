import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type SelectOption, type SelectProps } from '@/types';
import { type ProductFormType } from '../../model';
import { createProduct, createProductInputDialog } from './ProductInputDialog.fixture';

describe('when input is valid', () => {
  test('should submit form', async () => {
    const user = userEvent.setup();
    const renderCategoryInputMock = vi.fn();
    const onSubmitMock = vi.fn();
    const product = createProduct().withCategory({ id: 1, name: 'Test category' }).please();

    render(
      createProductInputDialog()
        .withProduct(product)
        .withRenderCategoryInputMock(renderCategoryInputMock)
        .withOnSubmitMock(onSubmitMock)
        .please(),
    );

    const productName = await screen.findByPlaceholderText(/product name/i);
    const caloriesCost = screen.getByPlaceholderText(/calories cost/i);
    const defaultQuantity = screen.getByPlaceholderText(/default quantity/i);
    await user.type(productName, 'Test product');
    await user.clear(caloriesCost);
    await user.clear(defaultQuantity);
    await user.type(defaultQuantity, '50');
    await user.type(caloriesCost, '150');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(renderCategoryInputMock).toHaveBeenCalledWith(
      expect.objectContaining<Partial<SelectProps<SelectOption>>>({
        value: {
          id: 1,
          name: 'Test category',
        },
      }),
    );

    expect(onSubmitMock).toHaveBeenCalledWith<[ProductFormType]>({
      name: 'Test product',
      caloriesCost: 150,
      defaultQuantity: 50,
      category: {
        id: 1,
        name: 'Test category',
      },
    });
  });
});
