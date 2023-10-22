import { render, screen } from '@testing-library/react';
import CategoriesList from './CategoriesList';

describe('when categories are empty', () => {
  test('should show empty data message', () => {
    render(<CategoriesList categories={[]} />);

    expect(screen.getByText(/no categories/i));
  });
});
