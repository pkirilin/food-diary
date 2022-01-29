import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Chip, Tooltip } from '@material-ui/core';
import TodayIcon from '@material-ui/icons/Today';
import EventIcon from '@material-ui/icons/Event';
import dateFnsFormat from 'date-fns/format';
import { endDateChanged, startDateChanged } from '../slice';
import { useTypedSelector } from '../../__shared__/hooks';
import { useFilterAppliedParamsStyles } from '../../__shared__/styles';

function formatDate(date: string) {
  return dateFnsFormat(new Date(date), 'dd.MM.yyyy');
}

const PagesFilterAppliedParams: React.FC = () => {
  const classes = useFilterAppliedParamsStyles();

  const startDate = useTypedSelector(state => state.pages.filter.startDate);
  const endDate = useTypedSelector(state => state.pages.filter.endDate);

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
            icon={<TodayIcon></TodayIcon>}
            label={formatDate(startDate)}
            onDelete={() => {
              dispatch(startDateChanged());
            }}
          ></Chip>
        </Tooltip>
      )}
      {endDate && (
        <Tooltip title="Applied filter: end date">
          <Chip
            variant="outlined"
            icon={<EventIcon></EventIcon>}
            label={formatDate(endDate)}
            onDelete={() => {
              dispatch(endDateChanged());
            }}
          ></Chip>
        </Tooltip>
      )}
    </Box>
  );
};

export default PagesFilterAppliedParams;
