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
  initialValue?: AutocompleteOption;
  allowEmptyOptions?: boolean;
};

const AppSelectTest: React.FC<AppSelectTestProps> = ({ initialValue, allowEmptyOptions }) => {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  function getDisplayName({ name }: AutocompleteOption) {
    return name;
  }

  function areOptionsEqual(first: AutocompleteOption, second: AutocompleteOption) {
    return first.name === second.name;
  }

  function handleOpen() {
    if (optionsLoaded) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setOptions(allowEmptyOptions ? [] : TEST_OPTIONS);
      setIsLoading(false);
      setOptionsLoaded(true);
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
      value={initialValue}
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
  render(<AppSelectTest />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));
  await userEvent.type(input, 'Jo');
  await userEvent.click(screen.getByLabelText(/close/i));
  await userEvent.click(screen.getByLabelText(/open/i));

  expect(screen).toContainOptions('John');
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
  render(<AppSelectTest initialValue={TEST_OPTIONS[1]} />);

  expect(screen.getByDisplayValue('Peter')).toBeInTheDocument();
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
