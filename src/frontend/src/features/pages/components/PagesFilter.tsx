import { Box, Button, Paper } from '@mui/material';
import { type FC, useEffect } from 'react';
import { DatePicker } from 'src/components';
import { useInput } from 'src/hooks';
import { mapToDateInputProps } from 'src/utils/inputMapping';
import { validateDate } from 'src/utils/validation';
import { useFilter } from '../hooks';
import { endDateChanged, startDateChanged } from '../slice';

const PagesFilter: FC = () => {
  const { initialStartDate, initialEndDate, isChanged, applyToDatePart, reset } = useFilter();

  const {
    inputProps: startDateInputProps,
    value: startDate,
    setValue: setStartDate,
  } = useInput({
    initialValue: null,
    errorHelperText: 'Start date is required',
    validate: validateDate,
    mapToInputProps: mapToDateInputProps,
  });

  const {
    inputProps: endDateInputProps,
    value: endDate,
    setValue: setEndDate,
  } = useInput({
    initialValue: null,
    errorHelperText: 'End date is required',
    validate: validateDate,
    mapToInputProps: mapToDateInputProps,
  });

  useEffect(() => {
    applyToDatePart(startDate, startDateChanged);
    applyToDatePart(endDate, endDateChanged);
  }, [applyToDatePart, startDate, endDate]);

  useEffect(() => {
    if (initialStartDate) {
      setStartDate(initialStartDate);
    }

    if (initialEndDate) {
      setEndDate(initialEndDate);
    }
  }, [initialStartDate, initialEndDate, setStartDate, setEndDate]);

  return (
    <Box component={Paper} p={2}>
      <DatePicker {...startDateInputProps} label="Start date" placeholder="Select start date" />
      <DatePicker {...endDateInputProps} label="End date" placeholder="Select end date" />
      <Box display="flex" justifyContent="flex-end">
        <Button variant="text" disabled={!isChanged} onClick={reset}>
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default PagesFilter;
