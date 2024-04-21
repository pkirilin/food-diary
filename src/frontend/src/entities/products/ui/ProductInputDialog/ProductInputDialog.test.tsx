import { ThemeProvider } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '@/theme';
import { type SelectOption, type SelectProps } from '@/types';
import { type ProductFormType } from '../../model';
import { ProductInputDialog } from './ProductInputDialog';

describe('when input is valid', () => {
  test('should submit form', async () => {
    const user = userEvent.setup();
    const renderCategoryInputMock = vi.fn();
    const onSubmitMock = vi.fn();

    render(
      <ThemeProvider theme={theme}>
        <ProductInputDialog
          opened
          submitting={false}
          title="Test"
          submitText="Submit"
          formId="test-form"
          product={{
            name: '',
            caloriesCost: 100,
            defaultQuantity: 100,
            category: {
              id: 1,
              name: 'Test category',
            },
          }}
          renderCategoryInput={renderCategoryInputMock}
          onSubmit={onSubmitMock}
          onClose={vi.fn()}
        />
      </ThemeProvider>,
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
      expect.objectContaining({
        value: {
          id: 1,
          name: 'Test category',
        },
      } satisfies Partial<SelectProps<SelectOption>>),
    );

    expect(onSubmitMock).toHaveBeenCalledWith({
      name: 'Test product',
      caloriesCost: 150,
      defaultQuantity: 50,
      category: {
        id: 1,
        name: 'Test category',
      },
    } satisfies ProductFormType);
  });
});
