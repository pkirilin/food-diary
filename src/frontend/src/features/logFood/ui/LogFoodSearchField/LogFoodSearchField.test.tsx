import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { LogFoodSearchField } from './LogFoodSearchField';

const SearchFieldWithQuery = ({ initialQuery }: { initialQuery: string }) => {
  const [query, setQuery] = useState(initialQuery);
  return <LogFoodSearchField query={query} onQueryChange={setQuery} />;
};

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
