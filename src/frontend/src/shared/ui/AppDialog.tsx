import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { type FC, type ReactElement } from 'react';

interface AppDialogProps {
  title: string;
  isOpened: boolean;
  onClose: () => void;
  content: ReactElement;
  actionSubmit: ReactElement;
  actionCancel?: ReactElement;
}

/**
 * @deprecated Use shared/ui/Dialog instead
 */
export const AppDialog: FC<AppDialogProps> = ({
  title,
  isOpened,
  onClose,
  content,
  actionSubmit,
  actionCancel,
}) => {
  return (
    <Dialog open={isOpened} onClose={onClose} fullWidth>
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
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{content}</DialogContent>
      <DialogActions
        disableSpacing
        sx={theme => ({
          marginTop: theme.spacing(3),
          padding: `0 ${theme.spacing(3)} ${theme.spacing(2)}`,

          '& > :not(:first-of-type)': {
            marginLeft: theme.spacing(2),
          },
        })}
      >
        {actionCancel}
        {actionSubmit}
      </DialogActions>
    </Dialog>
  );
};
