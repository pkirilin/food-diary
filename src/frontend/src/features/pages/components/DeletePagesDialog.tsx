import { Typography } from '@mui/material';
import { type FC } from 'react';
import { AppButton, AppDialog } from 'src/components';

interface DeletePagesDialogProps {
  isOpened: boolean;
  isLoading: boolean;
  pageIds: number[];
  onClose: () => void;
  onSubmit: (pageIds: number[]) => void;
}

const DeletePagesDialog: FC<DeletePagesDialogProps> = ({
  isOpened,
  isLoading,
  pageIds,
  onClose,
  onSubmit,
}) => {
  const handleSubmit = (): void => {
    onSubmit(pageIds);
  };

  return (
    <AppDialog
      title="Delete pages confirmation"
      isOpened={isOpened}
      content={<Typography>Do you really want to delete all selected pages?</Typography>}
      actionSubmit={
        <AppButton variant="contained" color="primary" onClick={handleSubmit} isLoading={isLoading}>
          Yes
        </AppButton>
      }
      actionCancel={
        <AppButton variant="text" onClick={onClose} isLoading={isLoading}>
          No
        </AppButton>
      }
      onClose={onClose}
    />
  );
};

export default DeletePagesDialog;
