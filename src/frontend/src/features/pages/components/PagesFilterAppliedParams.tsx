import EventIcon from '@mui/icons-material/Event';
import TodayIcon from '@mui/icons-material/Today';
import { Box, Chip, Tooltip } from '@mui/material';
import dateFnsFormat from 'date-fns/format';
import { type FC } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../__shared__/hooks';
import { endDateChanged, startDateChanged } from '../slice';

const formatDate = (date: string): string => dateFnsFormat(new Date(date), 'dd.MM.yyyy');

const PagesFilterAppliedParams: FC = () => {
  const startDate = useAppSelector(state => state.pages.filter.startDate);
  const endDate = useAppSelector(state => state.pages.filter.endDate);
  const dispatch = useDispatch();

  if (!startDate && !endDate) {
    return null;
  }

  return (
    <Box p={2}>
      {startDate && (
        <Tooltip title="Applied filter: start date">
          <Chip
            variant="outlined"
            icon={<TodayIcon />}
            label={formatDate(startDate)}
            onDelete={() => {
              dispatch(startDateChanged());
            }}
          />
        </Tooltip>
      )}
      {endDate && (
        <Tooltip title="Applied filter: end date">
          <Chip
            variant="outlined"
            icon={<EventIcon />}
            label={formatDate(endDate)}
            onDelete={() => {
              dispatch(endDateChanged());
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default PagesFilterAppliedParams;
