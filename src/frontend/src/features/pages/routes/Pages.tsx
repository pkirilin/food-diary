import { Paper, Typography } from '@mui/material';
import { Container, Box } from '@mui/system';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { FC, useCallback } from 'react';
import { DEMO_MODE_ENABLED } from 'src/config';
import { useAppSelector, useAppDispatch } from 'src/hooks';
import { SortOrder } from 'src/types';
import DemoPagesWarning from '../components/DemoPagesWarning';
import PagesFilterAppliedParams from '../components/PagesFilterAppliedParams';
import PagesTable from '../components/PagesTable';
import PagesTablePagination from '../components/PagesTablePagination';
import PagesToolbar from '../components/PagesToolbar';
import { PageItemsFilter } from '../models';
import { allPagesSelected, sortOrderChanged } from '../slice';
import { getPages } from '../thunks';

const Pages: FC = () => {
  const pages = useAppSelector(state => state.pages.pageItems);
  const selectedPagesCount = useAppSelector(state => state.pages.selectedPageIds.length);
  const pagesFilter = useAppSelector(state => state.pages.filter);
  const operationStatus = useAppSelector(state => state.pages.operationStatus);
  const dispatch = useAppDispatch();

  const handleRefetch = useCallback(
    ({ sortOrder, pageNumber, pageSize, startDate, endDate }: PageItemsFilter) => {
      dispatch(
        getPages({
          sortOrder,
          pageNumber,
          pageSize,
          startDate: startDate ?? null,
          endDate: endDate ?? null,
        }),
      );
    },
    [dispatch],
  );

  const handleSelectAll = (isSelected: boolean): void => {
    dispatch(
      allPagesSelected({
        selected: !isSelected,
      }),
    );
  };

  const handleReorder = (order: SortOrder): void => {
    dispatch(sortOrderChanged(order));
  };

  return (
    <Container>
      <Box py={3}>
        {DEMO_MODE_ENABLED && (
          <Box pb={3}>
            <DemoPagesWarning />
          </Box>
        )}
        <Typography sx={visuallyHidden} variant="h1" gutterBottom>
          Pages
        </Typography>
        <Paper>
          <PagesToolbar />
          <PagesFilterAppliedParams />
          <PagesTable
            pages={pages}
            selectedPagesCount={selectedPagesCount}
            filter={pagesFilter}
            operationStatus={operationStatus}
            onRefetch={handleRefetch}
            onSelectAll={handleSelectAll}
            onReorder={handleReorder}
          />
          <PagesTablePagination />
        </Paper>
      </Box>
    </Container>
  );
};

export default Pages;
