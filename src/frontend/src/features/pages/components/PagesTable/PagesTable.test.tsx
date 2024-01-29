import { render, screen } from '@testing-library/react';
import { SortOrder } from 'src/types';
import PagesTable from './PagesTable';

describe('when pages are empty', () => {
  test('should show empty data message', async () => {
    render(
      <PagesTable
        pages={[]}
        selectedPagesCount={0}
        filter={{
          pageNumber: 1,
          pageSize: 10,
          sortOrder: SortOrder.Descending,
          changed: false,
        }}
        onSelectAll={vi.fn()}
        onReorder={vi.fn()}
      />,
    );

    expect(screen.getByText(/no pages found/i));
  });
});
