import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Breadcrumbs, IconButton, Tooltip, Typography } from '@mui/material';
import { type FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { noteLib } from '@/entities/note';
import { type MealType } from '@/entities/note/model';
import { type Page } from '@/features/pages';
import { formatDate } from '@/shared/lib';

interface Props {
  page: Page;
  mealType: MealType;
}

export const Subheader: FC<Props> = ({ page, mealType }) => {
  const date = formatDate(new Date(page.date));
  const mealName = noteLib.getMealName(mealType);

  return (
    <Box display="flex" alignItems="center" gap={3} width="100%">
      <Tooltip title="Back to notes">
        <IconButton edge="start" component={RouterLink} to={`/pages/${page.id}`}>
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      <Breadcrumbs>
        <Typography>{date}</Typography>
        <Typography>{mealName}</Typography>
      </Breadcrumbs>
    </Box>
  );
};
