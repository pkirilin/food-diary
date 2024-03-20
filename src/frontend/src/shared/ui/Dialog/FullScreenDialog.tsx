import CloseIcon from '@mui/icons-material/Close';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Dialog as MuiDialog,
  Box,
  Slide,
} from '@mui/material';
import { type TransitionProps } from '@mui/material/transitions';
import { forwardRef, type FC } from 'react';
import { type DialogBaseProps } from './types';

interface Props extends DialogBaseProps {}

const Transition = forwardRef(function FullScreenDialogTransition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FullScreenDialog: FC<Props> = ({ title, opened, content, onClose, renderSubmit }) => (
  <MuiDialog open={opened} onClose={onClose} fullWidth fullScreen TransitionComponent={Transition}>
    <AppBar position="relative">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
          {title}
        </Typography>
        {renderSubmit({
          color: 'inherit',
          variant: 'text',
          hiddenWhenDisabled: true,
        })}
      </Toolbar>
    </AppBar>
    <Box p={2}>{content}</Box>
  </MuiDialog>
);

export default FullScreenDialog;
