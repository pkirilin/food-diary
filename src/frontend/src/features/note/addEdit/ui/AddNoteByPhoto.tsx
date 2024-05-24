import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { Box, Input } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { type FormEventHandler, type FC } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import { type noteModel } from '@/entities/note';
import { Button } from '@/shared/ui';

interface Props {
  pageId: number;
  mealType: noteModel.MealType;
  displayOrder: number;
}

export const AddNoteByPhoto: FC<Props> = ({ pageId, mealType, displayOrder }) => {
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
        <Input sx={visuallyHidden} type="file" name="photos" />
      </Button>
      <Input type="hidden" name="mealType" value={mealType} />
      <Input type="hidden" name="displayOrder" value={displayOrder} />
    </Box>
  );
};
