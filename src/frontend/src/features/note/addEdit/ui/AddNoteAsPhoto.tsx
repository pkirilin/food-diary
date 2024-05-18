import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { Input } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { type FC } from 'react';
import { Button } from '@/shared/ui';

export const AddNoteAsPhoto: FC = () => (
  <Button role={undefined} component="label" variant="text" fullWidth startIcon={<AddAPhotoIcon />}>
    Add photo
    <Input sx={visuallyHidden} type="file" />
  </Button>
);
