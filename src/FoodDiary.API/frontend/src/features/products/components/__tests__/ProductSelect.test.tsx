import { ReactElement } from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { create, server, rest, api } from 'src/test-utils';

import ProductSelect from '../ProductSelect';

let ui: ReactElement;

describe('ProductSelect', () => {
  describe('when value is omitted', () => {
    beforeEach(() => {
      ui = create
        .component(
          <ProductSelect
            label="Product"
            placeholder="Select a product"
            setValue={jest.fn()}
          ></ProductSelect>,
        )
        .withReduxStore()
        .please();
    });

    test('shows all options after clicking on input', async () => {
      render(ui);

      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      expect(screen).toContainOptions('Bread', 'Cheese', 'Eggs', 'Meat');
    });

    test('shows options matching input value', async () => {
      render(ui);

      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      userEvent.type(input, 'ea');
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      expect(screen).toContainOptions('Bread', 'Meat');
    });

    test('shows no options if input value does not match any existing option', async () => {
      render(ui);

      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      userEvent.type(input, 'test');
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      const options = screen.queryAllByRole('option');
      expect(options).toHaveLength(0);
    });

    test('shows all options after input cleared', async () => {
      render(ui);

      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      userEvent.type(input, 'ea');
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));
      userEvent.click(screen.getByLabelText(/clear/i));

      expect(screen).toContainOptions('Bread', 'Cheese', 'Eggs', 'Meat');
    });

    test('shows no options after clicking on input if autocomplete has no options', async () => {
      server.use(
        rest.get(api('/api/v1/products/autocomplete'), (req, res, ctx) => res(ctx.json([]))),
      );

      render(ui);
      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      expect(screen).toContainEmptyOptions();
    });

    test('shows all options if closed with filtered options and then opened again', async () => {
      render(ui);

      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));
      userEvent.type(input, 'ea');
      userEvent.tab();
      userEvent.click(input);

      expect(screen).toContainOptions('Bread', 'Cheese', 'Eggs', 'Meat');
    });
  });

  describe('when value is specified', () => {
    test('initializes selected value if it specified', () => {
      ui = create
        .component(
          <ProductSelect
            value={{ id: 1, name: 'Test product' }}
            setValue={jest.fn()}
          ></ProductSelect>,
        )
        .withReduxStore()
        .please();

      render(ui);

      expect(screen.getByDisplayValue('Test product')).toBeInTheDocument();
    });
  });
});
