import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type RenderInputDialogProps } from './ProductAutocomplete';
import { createProductAutocomplete, givenOptions } from './ProductAutocomplete.fixture';

describe('when existing option is selected', () => {
  test('should call onChange with that option', async () => {
    const options = givenOptions('Bread', 'Milk', 'Cheese');
    const onChangeMock = vi.fn();
    const user = userEvent.setup();
    const ui = createProductAutocomplete()
      .withOnChangeMock(onChangeMock)
      .withOptions(options)
      .please();

    render(ui);
    await user.type(screen.getByPlaceholderText(/product/i), 'Mi');
    await user.click(screen.getByRole('option', { name: /milk/i }));

    expect(onChangeMock).toHaveBeenCalledWith(options[1]);
  });
});

describe('when typing non existing option', () => {
  test('should suggest adding option on the fly', async () => {
    const options = givenOptions('Bread', 'Milk', 'Cheese');
    const renderInputDialogMock = vi.fn();
    const user = userEvent.setup();
    const ui = createProductAutocomplete()
      .withRenderInputDialogMock(renderInputDialogMock)
      .withOptions(options)
      .please();

    render(ui);
    await user.type(screen.getByPlaceholderText(/product/i), 'Chicken');
    await user.click(screen.getByRole('option', { name: /add "chicken"/i }));

    expect(renderInputDialogMock).toHaveBeenLastCalledWith(
      expect.objectContaining<Partial<RenderInputDialogProps>>({
        title: 'Add product',
        submitText: 'Create',
        opened: true,
        submitting: false,
        product: {
          name: 'Chicken',
          defaultQuantity: 100,
          caloriesCost: 100,
          category: null,
        },
      }),
    );
  });
});

describe('when current input value does not exist in options', () => {
  test('should suggest editing option on the fly', async () => {
    const options = givenOptions('Bread', 'Milk', 'Cheese');
    const renderInputDialogMock = vi.fn();
    const user = userEvent.setup();
    const ui = createProductAutocomplete()
      .withRenderInputDialogMock(renderInputDialogMock)
      .withOptions(options)
      .withValue({
        freeSolo: true,
        name: 'Chicken',
        defaultQuantity: 120,
        caloriesCost: 150,
        category: {
          id: 1,
          name: 'Meat',
        },
      })
      .please();

    render(ui);
    await user.click(screen.getByPlaceholderText(/product/i));
    await user.click(screen.getByRole('option', { name: /edit "chicken"/i }));

    expect(renderInputDialogMock).toHaveBeenLastCalledWith(
      expect.objectContaining<Partial<RenderInputDialogProps>>({
        title: 'Edit product',
        submitText: 'Save',
        opened: true,
        submitting: false,
        product: {
          name: 'Chicken',
          defaultQuantity: 120,
          caloriesCost: 150,
          category: {
            id: 1,
            name: 'Meat',
          },
        },
      }),
    );
  });
});
