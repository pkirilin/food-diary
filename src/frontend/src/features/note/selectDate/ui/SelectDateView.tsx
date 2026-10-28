import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Box,
  ButtonBase,
  DialogActions,
  IconButton,
  Popover,
  Typography,
  useMediaQuery,
  type PopoverProps,
  type SxProps,
  type Theme,
} from '@mui/material';
import {
  StaticDatePicker,
  dateCalendarClasses,
  dayCalendarClasses,
  monthCalendarClasses,
  pickerDayClasses,
  yearCalendarClasses,
} from '@mui/x-date-pickers';
import { useState, type FC } from 'react';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { dateLib } from '@/shared/lib';
import { Button } from '@/shared/ui';

export type OnSubmitDateFn = (date: Date) => void;

interface Props {
  currentDate: Date;
  onSubmitDate: OnSubmitDateFn;
}

const DAY_CELL_MIN_SIZE = 48;
const DAYS_IN_WEEK = 7;
const WEEKS_IN_GRID = 6;

const appBarHeight = { xs: APP_BAR_HEIGHT_XS, sm: APP_BAR_HEIGHT_SM };
const gridWidth = `calc(${DAYS_IN_WEEK} * var(--day-cell-size))`;

const paperSx: SxProps<Theme> = {
  '--day-cell-size': {
    xs: `max(${DAY_CELL_MIN_SIZE}px, calc(100vw / ${DAYS_IN_WEEK}))`,
    sm: `${DAY_CELL_MIN_SIZE}px`,
  },
  width: { xs: '100%', sm: gridWidth },
  maxWidth: '100%',
  maxHeight: {
    xs: `calc(100% - ${APP_BAR_HEIGHT_XS}px)`,
    sm: `calc(100% - ${APP_BAR_HEIGHT_SM}px)`,
  },
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
};

const scrimBelowAppBarSx: SxProps<Theme> = {
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    top: appBarHeight,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
};

const calendarSx: SxProps<Theme> = {
  [`& .${dateCalendarClasses.root}, & .${monthCalendarClasses.root}, & .${yearCalendarClasses.root}`]:
    {
      width: gridWidth,
    },
  [`& .${dateCalendarClasses.root}`]: {
    height: 'auto',
    maxHeight: 'none',
  },
  [`& .${dayCalendarClasses.weekDayLabel}`]: {
    width: 'var(--day-cell-size)',
    margin: 0,
  },
  [`& .${dayCalendarClasses.weekContainer}`]: {
    margin: 0,
  },
  [`& .${dayCalendarClasses.slideTransition}`]: {
    minHeight: `calc(${WEEKS_IN_GRID} * var(--day-cell-size))`,
  },
  [`& .${pickerDayClasses.root}`]: {
    '--PickerDay-size': 'var(--day-cell-size)',
    '--PickerDay-horizontalMargin': 0,
  },
};

const anchorBelowAppBar = (dateButton: HTMLElement, isSmUp: boolean): PopoverProps['anchorEl'] => ({
  nodeType: Node.ELEMENT_NODE,
  getBoundingClientRect: () =>
    new DOMRect(
      isSmUp ? dateButton.getBoundingClientRect().left : 0,
      isSmUp ? APP_BAR_HEIGHT_SM : APP_BAR_HEIGHT_XS,
    ),
});

export const SelectDateView: FC<Props> = ({ currentDate, onSubmitDate }) => {
  const [dateButton, setDateButton] = useState<HTMLButtonElement | null>(null);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const isSmUp = useMediaQuery<Theme>(theme => theme.breakpoints.up('sm'));
  const id = dateButton ? 'select-date-popover' : undefined;

  const closePopover = (): void => {
    setDateButton(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        color="inherit"
        aria-label="Previous day"
        onClick={() => {
          onSubmitDate(dateLib.addDays(currentDate, -1));
        }}
      >
        <ChevronLeftIcon />
      </IconButton>
      <ButtonBase
        onClick={event => {
          setSelectedDate(currentDate);
          setDateButton(event.currentTarget);
        }}
      >
        <Typography variant="h6" component="span">
          {dateLib.formatToUserFriendlyString(currentDate)}
        </Typography>
        {dateButton ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </ButtonBase>
      <IconButton
        color="inherit"
        aria-label="Next day"
        onClick={() => {
          onSubmitDate(dateLib.addDays(currentDate, 1));
        }}
      >
        <ChevronRightIcon />
      </IconButton>
      <Popover
        id={id}
        open={!!dateButton}
        anchorEl={dateButton && anchorBelowAppBar(dateButton, isSmUp)}
        marginThreshold={0}
        onClose={closePopover}
        slotProps={{
          paper: { sx: paperSx },
          backdrop: { sx: scrimBelowAppBarSx },
        }}
      >
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          value={selectedDate}
          views={['year', 'month', 'day']}
          showDaysOutsideCurrentMonth
          fixedWeekNumber={WEEKS_IN_GRID}
          onChange={newDate => {
            if (newDate) {
              setSelectedDate(newDate);
            }
          }}
          sx={calendarSx}
          slotProps={{ actionBar: { actions: [] } }}
        />
        <DialogActions>
          <Button onClick={closePopover}>Cancel</Button>
          <Button
            onClick={() => {
              onSubmitDate(selectedDate);
              closePopover();
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Popover>
    </Box>
  );
};
