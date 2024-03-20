import { useMediaQuery, useTheme, Slide, Fade } from '@mui/material';
import { type TransitionProps } from '@mui/material/transitions';
import { forwardRef } from 'react';

export const DialogTransition = forwardRef(function DialogTransition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  return mobile ? <Slide direction="up" ref={ref} {...props} /> : <Fade ref={ref} {...props} />;
});
