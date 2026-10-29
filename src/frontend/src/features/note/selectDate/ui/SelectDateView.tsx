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
  type Theme,
} from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { useState, type FC } from 'react';
import { APP_BAR_HEIGHT_SM, APP_BAR_HEIGHT_XS } from '@/shared/constants';
import { dateLib } from '@/shared/lib';
import { Button } from '@/shared/ui';
import { WEEKS_IN_GRID, calendarSx, paperSx, popoverSx, scrimBelowAppBarSx } from './styles';

export type OnSubmitDateFn = (date: Date) => void;

interface Props {
  currentDate: Date;
  onSubmitDate: OnSubmitDateFn;
}

interface AnchorPosition {
  left: number;
  top: number;
}

interface VirtualAnchor {
  nodeType: Node['ELEMENT_NODE'];
  getBoundingClientRect: () => DOMRect;
}

const virtualAnchorAt = ({ left, top }: AnchorPosition): VirtualAnchor => ({
  // MUI Popover positions against document.body unless the anchor reports itself as an element node
  nodeType: Node.ELEMENT_NODE,
  getBoundingClientRect: () => new DOMRect(left, top),
});

export const SelectDateView: FC<Props> = ({ currentDate, onSubmitDate }) => {
  const [dateButton, setDateButton] = useState<HTMLButtonElement | null>(null);
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const isSmUp = useMediaQuery<Theme>(theme => theme.breakpoints.up('sm'));
  const id = dateButton ? 'select-date-popover' : undefined;

  const closePopover = (): void => {
    setDateButton(null);
  };

  const getAnchorPositionBelowAppBar = (button: HTMLElement): AnchorPosition =>
    isSmUp
      ? { left: button.getBoundingClientRect().left, top: APP_BAR_HEIGHT_SM }
      : { left: 0, top: APP_BAR_HEIGHT_XS };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        color="inherit"
        aria-label="Previous day"
        edge="start"
        onClick={() => {
          onSubmitDate(dateLib.addDays(currentDate, -1));
        }}
      >
        <ChevronLeftIcon />
      </IconButton>
      <ButtonBase
        sx={{ p: 1, borderRadius: 2 }}
        onClick={event => {
          setSelectedDate(currentDate);
          setDateButton(event.currentTarget);
        }}
      >
        <Typography variant="button" component="span">
          {dateLib.formatToUserFriendlyString(currentDate)}
        </Typography>
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
        anchorEl={dateButton && (() => virtualAnchorAt(getAnchorPositionBelowAppBar(dateButton)))}
        marginThreshold={0}
        sx={popoverSx}
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
