import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { type MealType } from '../models';

interface Props {
  pageId: number;
  mealType: MealType;
}

export const AddNote: FC<Props> = ({ pageId, mealType }) => (
  <Button
    component={Link}
    to={`/pages/${pageId}/notes/new?mealType=${mealType}`}
    variant="text"
    size="medium"
    fullWidth
    startIcon={<AddIcon />}
  >
    Add note
  </Button>
);
