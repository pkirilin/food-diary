import { ReactElement } from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import create from '../../../../test-utils';
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
      jest
        .mocked(global.fetch)
        .mockResolvedValue(
          create
            .response()
            .withJsonData(
              create
                .productAutocompleteResult()
                .withOption('Product 1')
                .withOption('Product 2')
                .please(),
            )
            .please(),
        );

      render(ui);
      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('Product 1');
      expect(options[1]).toHaveTextContent('Product 2');
    });

    test('shows options matching input value', async () => {
      jest
        .mocked(global.fetch)
        .mockResolvedValue(
          create
            .response()
            .withJsonData(
              create
                .productAutocompleteResult()
                .withOption('My first product')
                .withOption('My second product')
                .withOption('Another product')
                .please(),
            )
            .please(),
        );

      render(ui);
      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      userEvent.type(input, 'My');
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('My first product');
      expect(options[1]).toHaveTextContent('My second product');
    });

    test('shows no options if input value does not match any existing option', async () => {
      jest
        .mocked(global.fetch)
        .mockResolvedValue(
          create
            .response()
            .withJsonData(
              create
                .productAutocompleteResult()
                .withOption('My first product')
                .withOption('My second product')
                .withOption('Another product')
                .please(),
            )
            .please(),
        );

      render(ui);
      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      userEvent.type(input, 'test');
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      const options = screen.queryAllByRole('option');
      expect(options).toHaveLength(0);
    });

    test('shows all options after input cleared', async () => {
      jest
        .mocked(global.fetch)
        .mockResolvedValue(
          create
            .response()
            .withJsonData(
              create
                .productAutocompleteResult()
                .withOption('My product 1')
                .withOption('My product 2')
                .withOption('Some product')
                .please(),
            )
            .please(),
        );

      render(ui);
      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      userEvent.type(input, 'My');
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));
      userEvent.click(screen.getByLabelText(/clear/i));

      const options = await screen.findAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('My product 1');
      expect(options[1]).toHaveTextContent('My product 2');
      expect(options[2]).toHaveTextContent('Some product');
    });

    test('shows no options after clicking on input if autocomplete has no options', async () => {
      jest
        .mocked(global.fetch)
        .mockResolvedValue(
          create.response().withJsonData(create.productAutocompleteResult().please()).please(),
        );

      render(ui);
      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      const options = screen.queryAllByRole('option');
      expect(options).toHaveLength(0);
    });

    test('shows all options if closed with filtered options and then opened again', async () => {
      jest
        .mocked(global.fetch)
        .mockResolvedValue(
          create
            .response()
            .withJsonData(
              create
                .productAutocompleteResult()
                .withOption('My product 1')
                .withOption('My product 2')
                .please(),
            )
            .please(),
        );

      render(ui);

      const input = screen.getByRole('textbox', { name: /product/i });
      userEvent.click(input);
      userEvent.type(input, '1');
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));
      userEvent.tab();
      userEvent.click(input);
      await waitForElementToBeRemoved(screen.getByRole('progressbar'));

      const options = screen.queryAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent('My product 1');
      expect(options[1]).toHaveTextContent('My product 2');
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
