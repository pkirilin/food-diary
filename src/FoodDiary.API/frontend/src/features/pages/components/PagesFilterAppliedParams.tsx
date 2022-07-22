import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Chip, Tooltip } from '@mui/material';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import dateFnsFormat from 'date-fns/format';
import { endDateChanged, startDateChanged } from '../slice';
import { useAppSelector } from '../../__shared__/hooks';
import { useFilterAppliedParamsStyles } from '../../__shared__/styles';

function formatDate(date: string) {
  return dateFnsFormat(new Date(date), 'dd.MM.yyyy');
}

const PagesFilterAppliedParams: React.FC = () => {
  const classes = useFilterAppliedParamsStyles();

  const startDate = useAppSelector(state => state.pages.filter.startDate);
  const endDate = useAppSelector(state => state.pages.filter.endDate);

  const dispatch = useDispatch();

  if (!startDate && !endDate) {
    return null;
  }

  return (
    <Box className={classes.root}>
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
