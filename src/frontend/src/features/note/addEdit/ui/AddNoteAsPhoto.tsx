import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { Box, Input } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { type FormEventHandler, type FC } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import { Button } from '@/shared/ui';

interface Props {
  pageId: number;
}

export const AddNoteAsPhoto: FC<Props> = ({ pageId }) => {
  const submit = useSubmit();

  const handleFormChange: FormEventHandler<HTMLFormElement> = event => {
    submit(event.currentTarget);
  };

  return (
    <Box
      component={Form}
      action={`/pages/${pageId}`}
      method="post"
      encType="multipart/form-data"
      width="100%"
      onChange={handleFormChange}
    >
      <Button
        role={undefined}
        component="label"
        variant="text"
        fullWidth
        startIcon={<AddAPhotoIcon />}
      >
        Add photo
        <Input sx={visuallyHidden} type="file" name="photo" />
      </Button>
    </Box>
  );
};
