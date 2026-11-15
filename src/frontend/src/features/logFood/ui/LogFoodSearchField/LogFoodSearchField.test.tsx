import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FC, useState } from 'react';
import { LogFoodSearchField } from './LogFoodSearchField';

const SearchFieldWithQuery = ({ initialQuery }: { initialQuery: string }) => {
  const [query, setQuery] = useState(initialQuery);
  return <LogFoodSearchField query={query} onQueryChange={setQuery} />;
};

// The app's query comes back through a navigation, a few ticks after each keystroke
const SearchFieldWithLaggingQuery: FC = () => {
  const [query, setQuery] = useState('');
  return (
    <LogFoodSearchField
      query={query}
      onQueryChange={nextQuery => {
        setTimeout(() => {
          setQuery(nextQuery);
        });
      }}
    />
  );
};

test('the search field opens focused', () => {
  render(<SearchFieldWithQuery initialQuery="" />);

  expect(screen.getByRole('searchbox', { name: 'Search products' })).toHaveFocus();
});

test('fast typing in the search field keeps every typed letter', async () => {
  render(<SearchFieldWithLaggingQuery />);
  const searchField = screen.getByRole('searchbox', { name: 'Search products' });

  await userEvent.setup({ delay: null }).type(searchField, 'chick');

  await waitFor(() => expect(searchField).toHaveValue('chick'));
});

test('I can clear what I typed and keep typing', async () => {
  const user = userEvent.setup();
  render(<SearchFieldWithQuery initialQuery="" />);

  expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();

  await user.type(screen.getByRole('searchbox', { name: 'Search products' }), 'app');
  await user.click(screen.getByRole('button', { name: 'Clear search' }));

  expect(screen.getByRole('searchbox', { name: 'Search products' })).toHaveValue('');
  expect(screen.getByRole('searchbox', { name: 'Search products' })).toHaveFocus();
  expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();
});
