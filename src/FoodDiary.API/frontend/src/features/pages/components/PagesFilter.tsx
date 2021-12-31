import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, Paper } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { endDateChanged, filterReset, startDateChanged } from '../slice';
import { useTypedSelector, useValidatedDateInput } from '../../__shared__/hooks';
import { useFilterStyles } from '../../__shared__/styles';
import { createDateValidator } from '../../__shared__/validators';

const validateFilterDate = createDateValidator(false);

const PagesFilter: React.FC = () => {
  const classes = useFilterStyles();

  const filterStartDate = useTypedSelector(state => state.pages.filter.startDate || null);
  const filterEndDate = useTypedSelector(state => state.pages.filter.endDate || null);
  const filterChanged = useTypedSelector(state => state.pages.filter.changed);

  const dispatch = useDispatch();

  const [, , bindStartDate] = useValidatedDateInput(
    filterStartDate ? new Date(filterStartDate) : null,
    {
      afterChange: date => {
        if (validateFilterDate(date)) {
          dispatch(startDateChanged(date?.toISOString()));
        }
      },
      validate: validateFilterDate,
      errorHelperText: 'Start date is invalid',
    },
  );

  const [, , bindEndDate] = useValidatedDateInput(filterEndDate ? new Date(filterEndDate) : null, {
    afterChange: date => {
      if (validateFilterDate(date)) {
        dispatch(endDateChanged(date?.toISOString()));
      }
    },
    validate: validateFilterDate,
    errorHelperText: 'End date is invalid',
  });

  return (
    <Box component={Paper} className={classes.root}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          {...bindStartDate()}
          disableToolbar
          fullWidth
          variant="inline"
          format="dd.MM.yyyy"
          margin="normal"
          label="Start date"
        />
        <KeyboardDatePicker
          {...bindEndDate()}
          disableToolbar
          fullWidth
          variant="inline"
          format="dd.MM.yyyy"
          margin="normal"
          label="End date"
        />
      </MuiPickersUtilsProvider>
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
