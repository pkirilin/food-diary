import { type PopoverProps } from '@mui/material';
import { useState, type MouseEvent } from 'react';

export type ShowPopoverFn<TAnchorElement> = (event: MouseEvent<TAnchorElement>) => void;

export default function usePopover<TAnchorElement extends Element>(): [
  PopoverProps,
  ShowPopoverFn<TAnchorElement>,
] {
  const [anchorEl, setAnchorEl] = useState<TAnchorElement | null>(null);

  const show: ShowPopoverFn<TAnchorElement> = event => {
    setAnchorEl(event.currentTarget);
  };

  return [
    {
      open: Boolean(anchorEl),
      anchorEl,
      onClose: () => {
        setAnchorEl(null);
      },
    },
    show,
  ];
}
