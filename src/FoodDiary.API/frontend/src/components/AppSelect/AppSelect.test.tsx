import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'src/testing';
import { AutocompleteOption } from 'src/types';
import AppSelect from './AppSelect';

const OPTIONS: AutocompleteOption[] = [
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

const AppSelectTest: React.FC = () => {
  function getDisplayName({ name }: AutocompleteOption) {
    return name;
  }

  function areOptionsEqual(first: AutocompleteOption, second: AutocompleteOption) {
    return first.name === second.name;
  }

  return (
    <AppSelect
      availableOptions={OPTIONS}
      getDisplayName={getDisplayName}
      areOptionsEqual={areOptionsEqual}
      label="Name"
      placeholder="Select name"
    />
  );
};

test('all options are visible after clicking on input', async () => {
  render(<AppSelectTest />);

  await userEvent.click(screen.getByPlaceholderText(/select name/i));

  expect(screen).toContainOptions('John', 'Peter', 'Kate');
});

test('all options are visible if closed with filtered options and then opened again', () => {
  expect(false).toBeTruthy();
});

test('options can be marked as loading', () => {
  expect(false).toBeTruthy();
});

test('visible options match input value', () => {
  expect(false).toBeTruthy();
});

test('initializes selected value if it specified', () => {
  expect(false).toBeTruthy();
});

test('no options are visible if input value does not match any existing option', () => {
  expect(false).toBeTruthy();
});

test('no options are visible after input is closed', () => {
  expect(false).toBeTruthy();
});

test('no options are visible after clicking on input if autocomplete has no options', () => {
  expect(false).toBeTruthy();
});
