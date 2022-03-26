import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import create from '../../../../test-utils';
import CategorySelect from '../CategorySelect';

describe('CategorySelect', () => {
  test('shows all options after clicking on input', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        create
          .response()
          .withJsonData(
            create
              .categoryAutocompleteResult()
              .withOption('Category 1')
              .withOption('Category 2')
              .please(),
          )
          .please(),
      );

    const ui = create
      .component(<CategorySelect setCategory={jest.fn()}></CategorySelect>)
      .withReduxStore()
      .please();

    render(ui);
    const input = screen.getByRole('textbox', { name: /category/i });
    userEvent.click(input);
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Category 1');
    expect(options[1]).toHaveTextContent('Category 2');
  });

  test('shows options matching input value', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        create
          .response()
          .withJsonData(
            create
              .categoryAutocompleteResult()
              .withOption('My first category')
              .withOption('My second category')
              .withOption('Another category')
              .please(),
          )
          .please(),
      );

    const ui = create
      .component(<CategorySelect setCategory={jest.fn()}></CategorySelect>)
      .withReduxStore()
      .please();

    render(ui);
    const input = screen.getByRole('textbox', { name: /category/i });
    userEvent.click(input);
    userEvent.type(input, 'My');
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('My first category');
    expect(options[1]).toHaveTextContent('My second category');
  });

  test('shows no options if input value does not match any existing option', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        create
          .response()
          .withJsonData(
            create
              .categoryAutocompleteResult()
              .withOption('My first category')
              .withOption('My second category')
              .please(),
          )
          .please(),
      );

    const ui = create
      .component(<CategorySelect setCategory={jest.fn()}></CategorySelect>)
      .withReduxStore()
      .please();

    render(ui);
    const input = screen.getByRole('textbox', { name: /category/i });
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
              .categoryAutocompleteResult()
              .withOption('My category 1')
              .withOption('My category 2')
              .withOption('Some category')
              .please(),
          )
          .please(),
      );

    const ui = create
      .component(<CategorySelect setCategory={jest.fn()}></CategorySelect>)
      .withReduxStore()
      .please();

    render(ui);
    const input = screen.getByRole('textbox', { name: /category/i });
    userEvent.click(input);
    userEvent.type(input, 'My');
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    userEvent.click(screen.getByLabelText(/clear/i));

    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('My category 1');
    expect(options[1]).toHaveTextContent('My category 2');
    expect(options[2]).toHaveTextContent('Some category');
  });

  test('shows no options after clicking on input if autocomplete has no options', async () => {
    jest
      .mocked(global.fetch)
      .mockResolvedValue(
        create.response().withJsonData(create.categoryAutocompleteResult().please()).please(),
      );

    const ui = create
      .component(<CategorySelect setCategory={jest.fn()}></CategorySelect>)
      .withReduxStore()
      .please();

    render(ui);
    const input = screen.getByRole('textbox', { name: /category/i });
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
              .categoryAutocompleteResult()
              .withOption('My category 1')
              .withOption('My category 2')
              .please(),
          )
          .please(),
      );

    const ui = create
      .component(<CategorySelect setCategory={jest.fn()}></CategorySelect>)
      .withReduxStore()
      .please();

    render(ui);

    const input = screen.getByRole('textbox', { name: /category/i });
    userEvent.click(input);
    userEvent.type(input, '1');
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    userEvent.tab();
    userEvent.click(input);
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    const options = screen.queryAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('My category 1');
    expect(options[1]).toHaveTextContent('My category 2');
  });

  test('initializes selected value if it specified', async () => {
    const ui = create
      .component(
        <CategorySelect
          category={{
            id: 1,
            name: 'Test category',
          }}
          setCategory={jest.fn()}
        ></CategorySelect>,
      )
      .withReduxStore()
      .please();

    render(ui);

    expect(screen.getByDisplayValue('Test category')).toBeInTheDocument();
  });
});
