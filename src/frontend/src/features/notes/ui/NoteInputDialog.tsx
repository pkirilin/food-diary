import { Button, Input } from '@mui/material';
import { type FC } from 'react';
import { Form, Link } from 'react-router-dom';
import { AppDialog } from '@/components';
import { type MealType } from '../models';

interface Props {
  title: string;
  pageId: number;
  mealType: MealType;
  onClose: () => void;
}

export const NoteInputDialog: FC<Props> = ({ title, pageId, mealType, onClose }) => {
  return (
    <AppDialog
      isOpened
      title={title}
      content={
        <Form id="note-input-dialog" method="post" action={`/pages/${pageId}/notes/new`}>
          <Input type="hidden" name="pageId" value={pageId} />
          <Input type="hidden" name="mealType" value={mealType} />
        </Form>
      }
      actionSubmit={
        <Button form="note-input-dialog" type="submit" variant="text">
          Create
        </Button>
      }
      actionCancel={
        <Button
          component={Link}
          to={`/pages/${pageId}`}
          type="submit"
          variant="text"
          color="inherit"
        >
          Cancel
        </Button>
      }
      onClose={onClose}
    />
  );
};
