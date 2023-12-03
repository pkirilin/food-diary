import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FC, useState } from 'react';
import { type SelectOption } from 'src/types';
import AppSelect from './AppSelect';

const TEST_OPTIONS: SelectOption[] = [
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

interface AppSelectTestProps {
  initialValue?: SelectOption | null;
  allowEmptyOptions?: boolean;
  errorText?: string;
}

const AppSelectTest: FC<AppSelectTestProps> = ({
  initialValue = null,
  allowEmptyOptions,
  errorText,
}) => {
  const [value, setValue] = useState<SelectOption | null>(initialValue);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [optionsLoaded, setOptionsLoaded] = useState(false);

  const getDisplayName = (option: SelectOption): string => {
    return option.name;
  };

  const areOptionsEqual = (first: SelectOption, second: SelectOption): boolean => {
    return first.name === second.name;
  };

  const handleChange = (value: SelectOption | null): void => {
    setValue(value);
  };

  const handleOpen = (): void => {
    if (optionsLoaded) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setOptions(allowEmptyOptions ? [] : TEST_OPTIONS);
      setIsLoading(false);
      setOptionsLoaded(true);
    }, 50);
  };

  return (
    <AppSelect
      availableOptions={options}
      getDisplayName={getDisplayName}
      areOptionsEqual={areOptionsEqual}
      onChange={handleChange}
      onOpen={handleOpen}
      label="Name"
      placeholder="Select name"
      value={value}
      helperText={errorText}
      isLoading={isLoading}
      isInvalid={!!errorText}
    />
  );
};

test('all options are visible after clicking on input', async () => {
  render(<AppSelectTest />);

  await userEvent.click(screen.getByPlaceholderText(/select name/i));

  const options = screen.queryAllByRole('option');
  expect(options[0]).toHaveTextContent('John');
  expect(options[1]).toHaveTextContent('Peter');
  expect(options[2]).toHaveTextContent('Kate');
});

test('all options are visible if closed with filtered options and then opened again', async () => {
  render(<AppSelectTest />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  await userEvent.type(input, 'Jo');
  await userEvent.click(screen.getByLabelText(/close/i));
  await userEvent.click(screen.getByLabelText(/open/i));

  expect(screen.queryAllByRole('option')[0]).toHaveTextContent('John');
});

test('visible options match input value', async () => {
  render(<AppSelectTest />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  const loader = screen.queryByRole('progressbar');
  if (loader) {
    await waitForElementToBeRemoved(loader);
  }
  await userEvent.type(input, 'Jo');

  expect(screen.queryAllByRole('option')[0]).toHaveTextContent('John');
});

test('no options are visible if input value does not match any existing option', async () => {
  render(<AppSelectTest />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  await userEvent.type(input, 'Jack');

  expect(screen.queryAllByRole('option')).toHaveLength(0);
});

test('initializes selected value if it specified', () => {
  render(<AppSelectTest initialValue={TEST_OPTIONS[1]} />);

  expect(screen.getByDisplayValue('Peter')).toBeInTheDocument();
});

test('no options are visible after input is closed', async () => {
  render(<AppSelectTest />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  await userEvent.type(input, 'Jo');
  await userEvent.click(screen.getByLabelText(/close/i));

  expect(screen.queryAllByRole('option')).toHaveLength(0);
});

test('no options are visible after clicking on input if autocomplete has no options', async () => {
  render(<AppSelectTest allowEmptyOptions />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  await userEvent.type(input, 'Jo');

  expect(screen.queryAllByRole('option')).toHaveLength(0);
});

test('value can be selected', async () => {
  render(<AppSelectTest />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  await userEvent.type(input, 'ter');
  await userEvent.click(screen.queryAllByRole('option')[0]);

  expect(input).toHaveValue('Peter');
});

test('value can be changed', async () => {
  render(<AppSelectTest initialValue={TEST_OPTIONS[0]} />);

  const input = screen.getByPlaceholderText(/select name/i);
  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.type(input, 'ter');
  await userEvent.click(screen.queryAllByRole('option')[0]);

  expect(input).toHaveValue('Peter');
});

test('error text is visible if input invalid', async () => {
  render(<AppSelectTest errorText="Name is invalid" />);

  expect(screen.getByPlaceholderText(/select name/i)).toBeInvalid();
  expect(screen.getByText(/name is invalid/i)).toBeVisible();
});
