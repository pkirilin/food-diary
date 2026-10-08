import AddIcon from '@mui/icons-material/Add';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Tooltip, IconButton, Box } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { useState, type FC } from 'react';
import { Link } from 'react-router';
import { useToggle } from '@/shared/hooks';
import { Button, Dialog } from '@/shared/ui';

export type OnApplyFilterFn = (month: number, year: number) => void;

interface Props {
  date: Date;
  onApply: OnApplyFilterFn;
}

export const FilterNotesHistory: FC<Props> = ({ date, onApply }) => {
  const [filterVisible, toggleFilter] = useToggle();
  const [filterDate, setFilterDate] = useState(date);

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
        renderCancel={props => (
          <Button {...props} onClick={toggleFilter}>
            Cancel
          </Button>
        )}
        renderSubmit={props => (
          <Button
            {...props}
            onClick={() => {
              onApply(filterDate.getMonth() + 1, filterDate.getFullYear());
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
            // The picker's own Cancel resets the value without closing anything, which
            // would leave the dialog's Apply submitting the old month.
            slotProps={{ actionBar: { actions: [] } }}
          />
        }
      />
    </Box>
  );
};
