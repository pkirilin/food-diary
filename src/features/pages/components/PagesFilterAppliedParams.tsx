import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Chip, makeStyles, Tooltip } from '@material-ui/core';
import TodayIcon from '@material-ui/icons/Today';
import EventIcon from '@material-ui/icons/Event';
import { useTypedSelector } from '../../__shared__/hooks';
import { endDateChanged, startDateChanged } from '../slice';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    margin: theme.spacing(2),

    '& > :not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
}));

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

const PagesFilterAppliedParams: React.FC = () => {
  const classes = useStyles();

  const filter = useTypedSelector(state => state.pages.filter);
  const { startDate, endDate } = filter;

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
              dispatch(startDateChanged(undefined));
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
              dispatch(endDateChanged(undefined));
            }}
          ></Chip>
        </Tooltip>
      )}
    </Box>
  );
};

export default PagesFilterAppliedParams;
