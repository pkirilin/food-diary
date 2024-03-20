import CloseIcon from '@mui/icons-material/Close';
import {
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  Box,
  useTheme,
  type ButtonProps,
} from '@mui/material';
import { type ReactElement, type FC } from 'react';
import { DialogTransition } from './DialogTransition';

interface DialogActionProps extends ButtonProps {
  mobile?: boolean;
}

interface Props {
  title: string;
  opened: boolean;
  content: ReactElement;
  onClose: () => void;
  renderSubmit: (props: DialogActionProps) => ReactElement;
  renderCancel: (props: DialogActionProps) => ReactElement;
}

export const Dialog: FC<Props> = ({
  title,
  opened,
  content,
  onClose,
  renderSubmit,
  renderCancel,
}) => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <MuiDialog
      open={opened}
      onClose={onClose}
      fullWidth
      fullScreen={mobile}
      TransitionComponent={DialogTransition}
    >
      <Box display={{ xs: 'block', md: 'none' }}>
        <AppBar sx={{ position: 'relative' }}>
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
              mobile,
            })}
          </Toolbar>
        </AppBar>
        <Box p={2}>{content}</Box>
      </Box>
      <Box display={{ xs: 'none', md: 'block' }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: theme => theme.spacing(1),
            right: theme => theme.spacing(2),
            color: theme => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <MuiDialogTitle>{title}</MuiDialogTitle>
        <MuiDialogContent dividers>{content}</MuiDialogContent>
        <MuiDialogActions
          disableSpacing
          sx={theme => ({
            marginTop: theme.spacing(3),
            padding: `0 ${theme.spacing(3)} ${theme.spacing(2)}`,

            '& > :not(:first-of-type)': {
              marginLeft: theme.spacing(2),
            },
          })}
        >
          {renderCancel({
            color: 'primary',
            variant: 'text',
          })}
          {renderSubmit({
            color: 'primary',
            variant: 'text',
          })}
        </MuiDialogActions>
      </Box>
    </MuiDialog>
  );
};
