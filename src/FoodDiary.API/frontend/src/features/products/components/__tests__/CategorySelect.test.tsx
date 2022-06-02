import { ReactElement } from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { create, server, rest, api } from 'src/test-utils';

import CategorySelect from '../CategorySelect';

let ui: ReactElement;

describe('CategorySelect', () => {
  describe('when value is omitted', () => {
    beforeEach(() => {
      ui = create
        .component(
          <CategorySelect
            label="Category"
            placeholder="Select a category"
            setValue={jest.fn()}
          ></CategorySelect>,
        )
        .withReduxStore()
        .please();
    });

    test('shows all options after clicking on input', async () => {
      render(ui);

      const input = screen.getByRole('textbox', { name: /category/i });
      await userEvent.click(input);
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      expect(screen).toContainOptions('Bakery', 'Cereals', 'Dairy', 'Frozen Foods');
    });

    test('shows options matching input value', async () => {
      render(ui);

      const input = screen.getByRole('textbox', { name: /category/i });
      await userEvent.click(input);
      await userEvent.type(input, 'ry');

      expect(screen).toContainOptions('Bakery', 'Dairy');
    });

    test('shows no options if input value does not match any existing option', async () => {
      render(ui);

      const input = screen.getByRole('textbox', { name: /category/i });
      await userEvent.click(input);
      await userEvent.type(input, 'test');

      const options = screen.queryAllByRole('option');
      expect(options).toHaveLength(0);
    });

    test('shows all options after input cleared', async () => {
      render(ui);

      const input = screen.getByRole('textbox', { name: /category/i });
      await userEvent.click(input);
      await userEvent.type(input, 'frozen');
      await userEvent.click(screen.getByLabelText(/clear/i));

      expect(screen).toContainOptions('Bakery', 'Cereals', 'Dairy', 'Frozen Foods');
    });

    test('shows no options after clicking on input if autocomplete has no options', async () => {
      server.use(
        rest.get(api('/api/v1/categories/autocomplete'), (req, res, ctx) => res(ctx.json([]))),
      );

      render(ui);

      const input = screen.getByRole('textbox', { name: /category/i });
      await userEvent.click(input);
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      expect(screen).toContainEmptyOptions();
    });

    test('shows all options if closed with filtered options and then opened again', async () => {
      render(ui);

      const input = screen.getByRole('textbox', { name: /category/i });
      await userEvent.click(input);
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));
      await userEvent.type(input, 'ry');
      await userEvent.tab();
      await userEvent.click(input);

      expect(screen).toContainOptions('Bakery', 'Cereals', 'Dairy', 'Frozen Foods');
    });
  });

  describe('when value specified', () => {
    test('initializes selected value', async () => {
      ui = create
        .component(
          <CategorySelect
            value={{ id: 1, name: 'Test category' }}
            setValue={jest.fn()}
          ></CategorySelect>,
        )
        .withReduxStore()
        .please();

      render(ui);

      expect(screen.getByDisplayValue('Test category')).toBeInTheDocument();
    });
  });
});
