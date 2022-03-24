import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import create from '../../../../test-utils';
import CategorySelect from '../CategorySelect';

describe('CategorySelect', () => {
  test('starts loading options on open', () => {
    const ui = create
      .component(<CategorySelect setCategory={jest.fn()}></CategorySelect>)
      .withReduxStore()
      .please();

    render(ui);
    const input = screen.getByRole('textbox', { name: /category/i });
    userEvent.click(input);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays all options on open', async () => {
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

  test('displays options matching input value', async () => {
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

  test('displays empty message if input value does not match any loaded option', async () => {
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

  test('displays all options after input cleared', async () => {
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

  test('displays empty message if autocomplete has no options', async () => {
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

  test('displays all options if closed and then opened again', async () => {
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

    userEvent.click(screen.getByRole('textbox', { name: /category/i }));
    userEvent.tab();
    userEvent.click(screen.getByRole('textbox', { name: /category/i }));
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    const options = screen.queryAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('My category 1');
    expect(options[1]).toHaveTextContent('My category 2');
  });

  test('initializes selected category if it specified', async () => {
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
