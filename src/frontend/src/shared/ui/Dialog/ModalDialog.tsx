import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  IconButton,
} from '@mui/material';
import { type FC } from 'react';
import { type DialogBaseProps, type RenderActionFn } from './types';

interface Props extends DialogBaseProps {
  renderCancel: RenderActionFn;
}

const ModalDialog: FC<Props> = ({
  title,
  opened,
  content,
  disableContentPaddingTop,
  disableContentPaddingBottom,
  pinToTop,
  renderSubmit,
  renderCancel,
  onClose,
}) => (
  <MuiDialog
    open={opened}
    onClose={onClose}
    fullWidth
    sx={{
      '& .MuiDialog-container': {
        alignItems: pinToTop ? 'flex-start' : undefined,
      },
    }}
  >
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
    <MuiDialogContent
      sx={{
        paddingTop: disableContentPaddingTop ? 0 : undefined,
        paddingBottom: disableContentPaddingBottom ? 0 : undefined,
      }}
      dividers
    >
      {content}
    </MuiDialogContent>
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
  </MuiDialog>
);

export default ModalDialog;
