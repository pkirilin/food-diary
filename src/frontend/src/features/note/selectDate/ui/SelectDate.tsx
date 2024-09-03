import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { IconButton, Popover, TextField, Tooltip } from '@mui/material';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { useState, type FC } from 'react';
import { useSubmit } from 'react-router-dom';
import { dateLib } from '@/shared/lib';

interface Props {
  currentDate: Date;
}

export const SelectDate: FC<Props> = ({ currentDate }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const id = anchorEl ? 'select-date-popover' : undefined;
  const submit = useSubmit();

  return (
    <>
      <Tooltip title="Select date">
        <IconButton
          edge="start"
          aria-describedby={id}
          onClick={event => {
            setAnchorEl(event.currentTarget);
          }}
        >
          <CalendarMonthIcon />
        </IconButton>
      </Tooltip>
      <Popover
        id={id}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => {
          setAnchorEl(null);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          value={currentDate}
          onChange={newDate => {
            if (newDate) {
              submit(new URLSearchParams({ date: dateLib.formatToISOStringWithoutTime(newDate) }), {
                method: 'GET',
                action: '/',
              });
              setAnchorEl(null);
            }
          }}
          renderInput={params => <TextField {...params} />}
        />
      </Popover>
    </>
  );
};
