import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { Box, Input, styled } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { type FormEventHandler, type FC } from 'react';
import { Form, useSubmit } from 'react-router-dom';
import { type noteModel } from '@/entities/note';
import { Button } from '@/shared/ui';

interface Props {
  pageId: number;
  mealType: noteModel.MealType;
}

const FileInputStyled = styled('input')(() => ({ ...visuallyHidden }));

export const AddNoteByPhoto: FC<Props> = ({ pageId, mealType }) => {
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
        <FileInputStyled type="file" name="photos" accept=".jpg, .jpeg, .png" />
      </Button>
      <Input type="hidden" name="mealType" value={mealType} />
    </Box>
  );
};
