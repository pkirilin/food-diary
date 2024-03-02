import { Paper, Typography } from '@mui/material';
import { Box } from '@mui/system';
import visuallyHidden from '@mui/utils/visuallyHidden';
import { type FC } from 'react';
import { DEMO_MODE_ENABLED } from 'src/config';
import { useAppSelector, useAppDispatch } from 'src/hooks';
import { type SortOrder } from 'src/types';
import DemoPagesWarning from '../components/DemoPagesWarning';
import PagesFilterAppliedParams from '../components/PagesFilterAppliedParams';
import PagesTable from '../components/PagesTable';
import PagesTablePagination from '../components/PagesTablePagination';
import PagesToolbar from '../components/PagesToolbar';
import { usePages } from '../model';
import { allPagesSelected, sortOrderChanged } from '../slice';

const Pages: FC = () => {
  const selectedPagesCount = useAppSelector(state => state.pages.selectedPageIds.length);
  const dispatch = useAppDispatch();
  const pages = usePages();

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
    <>
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
          pages={pages.data}
          selectedPagesCount={selectedPagesCount}
          filter={pages.filter}
          onSelectAll={handleSelectAll}
          onReorder={handleReorder}
        />
        <PagesTablePagination totalPagesCount={pages.totalCount} />
      </Paper>
    </>
  );
};

export default Pages;
