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
import { type FC, type ReactElement, type Ref } from 'react';
import { type DialogBaseProps } from './types';

interface TransitionComponentProps extends TransitionProps {
  children: ReactElement;
  ref?: Ref<unknown>;
}

const Transition: FC<TransitionComponentProps> = props => <Slide direction="up" {...props} />;

const FullScreenDialog: FC<DialogBaseProps> = ({
  title,
  opened,
  content,
  disableContentPaddingTop,
  disableContentPaddingBottom,
  onClose,
  renderSubmit,
}) => (
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
    <Box
      sx={{
        pt: disableContentPaddingTop ? 0 : 2,
        pb: disableContentPaddingBottom ? 0 : 2,
        px: 2,
      }}
    >
      {content}
    </Box>
  </MuiDialog>
);

export default FullScreenDialog;
