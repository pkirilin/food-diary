import { Paper, Typography } from '@mui/material';
import { Container, Box } from '@mui/system';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { type FC } from 'react';
import { DEMO_MODE_ENABLED } from 'src/config';
import { useAppSelector, useAppDispatch } from 'src/hooks';
import { type SortOrder } from 'src/types';
import { pagesApi } from '../api';
import DemoPagesWarning from '../components/DemoPagesWarning';
import PagesFilterAppliedParams from '../components/PagesFilterAppliedParams';
import PagesTable from '../components/PagesTable';
import PagesTablePagination from '../components/PagesTablePagination';
import PagesToolbar from '../components/PagesToolbar';
import { toGetPagesRequest } from '../mapping';
import { allPagesSelected, sortOrderChanged } from '../slice';

const Pages: FC = () => {
  const selectedPagesCount = useAppSelector(state => state.pages.selectedPageIds.length);
  const pagesFilter = useAppSelector(state => state.pages.filter);
  const dispatch = useAppDispatch();
  const getPagesRequest = toGetPagesRequest(pagesFilter);
  const getPagesQuery = pagesApi.useGetPagesQuery(getPagesRequest);

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
            pages={getPagesQuery.data?.pageItems ?? []}
            selectedPagesCount={selectedPagesCount}
            filter={pagesFilter}
            onSelectAll={handleSelectAll}
            onReorder={handleReorder}
          />
          <PagesTablePagination totalPagesCount={getPagesQuery.data?.totalPagesCount ?? 0} />
        </Paper>
      </Box>
    </Container>
  );
};

export default Pages;
