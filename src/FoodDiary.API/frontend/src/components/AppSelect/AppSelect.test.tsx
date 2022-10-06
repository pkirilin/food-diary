import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { AutocompleteOption } from 'src/types';
import AppSelect from './AppSelect';

const TEST_OPTIONS: AutocompleteOption[] = [
  {
    id: 1,
    name: 'John',
  },
  {
    id: 2,
    name: 'Peter',
  },
  {
    id: 3,
    name: 'Kate',
  },
];

type AppSelectTestProps = {
  allowEmptyOptions?: boolean;
};

const AppSelectTest: React.FC<AppSelectTestProps> = ({ allowEmptyOptions }) => {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function getDisplayName({ name }: AutocompleteOption) {
    return name;
  }

  function areOptionsEqual(first: AutocompleteOption, second: AutocompleteOption) {
    return first.name === second.name;
  }

  function handleOpen() {
    setIsLoading(true);

    setTimeout(() => {
      setOptions(allowEmptyOptions ? [] : TEST_OPTIONS);
      setIsLoading(false);
    }, 50);
  }

  return (
    <AppSelect
      availableOptions={options}
      getDisplayName={getDisplayName}
      areOptionsEqual={areOptionsEqual}
      label="Name"
      placeholder="Select name"
      isLoading={isLoading}
      onOpen={handleOpen}
    />
  );
};

test('all options are visible after clicking on input', async () => {
  render(<AppSelectTest />);

  await userEvent.click(screen.getByPlaceholderText(/select name/i));
  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));

  expect(screen).toContainOptions('John', 'Peter', 'Kate');
});

test('all options are visible if closed with filtered options and then opened again', async () => {
  expect(false).toBeTruthy();
});

test('visible options match input value', async () => {
  render(<AppSelectTest />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.type(input, 'Jo');

  expect(screen).toContainOptions('John');
});

test('no options are visible if input value does not match any existing option', async () => {
  render(<AppSelectTest />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.type(input, 'Jack');

  expect(screen).toContainEmptyOptions();
});

test('initializes selected value if it specified', () => {
  expect(false).toBeTruthy();
});

test('no options are visible after input is closed', async () => {
  render(<AppSelectTest />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.type(input, 'Jo');
  await userEvent.click(screen.getByLabelText(/close/i));

  expect(screen).toContainEmptyOptions();
});

test('no options are visible after clicking on input if autocomplete has no options', async () => {
  render(<AppSelectTest allowEmptyOptions />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.type(input, 'Jo');

  expect(screen).toContainEmptyOptions();
});
