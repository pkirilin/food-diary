import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Tooltip, IconButton, Box } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { useState, type FC } from 'react';
import { Link, useSubmit } from 'react-router-dom';
import { useToggle } from '@/shared/hooks';
import { Button, Dialog } from '@/shared/ui';

interface Props {
  date: Date;
}

export const FilterNotesHistory: FC<Props> = ({ date }) => {
  const [filterVisible, toggleFilter] = useToggle();
  const [filterDate, setFilterDate] = useState(date);
  const submit = useSubmit();

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
      }}
    >
      <Tooltip title="Add notes">
        <IconButton color="inherit" component={Link} to="/">
          <AddIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={filterVisible ? 'Hide filter' : 'Show filter'}>
        <IconButton color="inherit" edge="end" onClick={toggleFilter}>
          <FilterAltIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        renderMode="fullScreenOnMobile"
        title="Filter history"
        opened={filterVisible}
        onClose={toggleFilter}
        renderCancel={props => <Button {...props}>Cancel</Button>}
        renderSubmit={props => (
          <Button
            {...props}
            onClick={() => {
              submit(
                new URLSearchParams({
                  month: (filterDate.getMonth() + 1).toString(),
                  year: filterDate.getFullYear().toString(),
                }),
                { action: '/history' },
              );
              toggleFilter();
            }}
          >
            Apply
          </Button>
        )}
        content={
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            openTo="month"
            views={['year', 'month']}
            value={filterDate}
            onChange={newDate => {
              if (newDate) {
                setFilterDate(newDate);
              }
            }}
          />
        }
      />
    </Box>
  );
};
