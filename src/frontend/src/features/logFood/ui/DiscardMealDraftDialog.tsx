import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import { type FC } from 'react';

interface Props {
  foodLogsCount: number;
  onDiscard: () => void;
  onCancel: () => void;
}

export const DiscardMealDraftDialog: FC<Props> = ({ foodLogsCount, onDiscard, onCancel }) => (
  <Dialog open onClose={onCancel}>
    <DialogTitle>
      Discard {foodLogsCount} {foodLogsCount === 1 ? 'food log' : 'food logs'}?
    </DialogTitle>
    <DialogActions>
      <Button variant="text" color="inherit" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="text" color="error" autoFocus onClick={onDiscard}>
        Discard
      </Button>
    </DialogActions>
  </Dialog>
);
