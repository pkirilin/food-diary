import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
