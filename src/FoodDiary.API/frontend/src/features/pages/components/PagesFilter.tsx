import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, Paper } from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import dateFnsFormat from 'date-fns/format';
import { endDateChanged, filterReset, startDateChanged } from '../slice';
import { useAppSelector, useValidatedDateInput } from '../../__shared__/hooks';
import { useFilterStyles } from '../../__shared__/styles';
import { createDateValidator } from '../../__shared__/validators';

const validateFilterDate = createDateValidator(false);

const PagesFilter: React.FC = () => {
  const classes = useFilterStyles();

  const filterStartDate = useAppSelector(state => state.pages.filter.startDate || null);
  const filterEndDate = useAppSelector(state => state.pages.filter.endDate || null);
  const filterChanged = useAppSelector(state => state.pages.filter.changed);

  const dispatch = useDispatch();

  const [, , bindStartDate] = useValidatedDateInput(
    filterStartDate ? new Date(filterStartDate) : null,
    {
      afterChange: date => {
        if (!validateFilterDate(date)) {
          return;
        }

        if (date === null) {
          dispatch(startDateChanged());
          return;
        }

        dispatch(startDateChanged(dateFnsFormat(date, 'yyyy-MM-dd')));
      },
      validate: validateFilterDate,
      errorHelperText: 'Start date is invalid',
    },
  );

  const [, , bindEndDate] = useValidatedDateInput(filterEndDate ? new Date(filterEndDate) : null, {
    afterChange: date => {
      if (!validateFilterDate(date)) {
        return;
      }

      if (date === null) {
        dispatch(endDateChanged());
        return;
      }

      dispatch(endDateChanged(dateFnsFormat(date, 'yyyy-MM-dd')));
    },
    validate: validateFilterDate,
    errorHelperText: 'End date is invalid',
  });

  return (
    <Box component={Paper} className={classes.root}>
      <KeyboardDatePicker
        {...bindStartDate()}
        fullWidth
        format="dd.MM.yyyy"
        margin="normal"
        label="Start date"
      />
      <KeyboardDatePicker
        {...bindEndDate()}
        fullWidth
        format="dd.MM.yyyy"
        margin="normal"
        label="End date"
      />
      <Box className={classes.controls}>
        <Button
          variant="text"
          color="default"
          disabled={!filterChanged}
          onClick={() => {
            dispatch(filterReset());
          }}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default PagesFilter;
