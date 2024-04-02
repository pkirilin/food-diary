import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  IconButton,
  Stack,
  Tooltip,
  Typography,
  type TypographyProps,
  styled,
  Box,
} from '@mui/material';
import { useMemo, type FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { notesApi } from 'src/features/notes';
import { formatDate } from 'src/utils';
import { type Page } from '../models';

interface Props {
  page: Page;
}

const TextStyled = styled(Typography)<TypographyProps>(({ theme }) => ({
  ...theme.typography.body1,
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.text.secondary,
}));

export const PageDetailHeader: FC<Props> = ({ page }) => {
  const getNotesQuery = notesApi.useGetNotesQuery({ pageId: page.id });
  const notes = useMemo(() => getNotesQuery.data ?? [], [getNotesQuery.data]);
  const totalCalories = useMemo(() => notes.reduce((sum, note) => sum + note.calories, 0), [notes]);

  return (
    <Box display="flex" alignItems="center" gap={3} width="100%">
      <Tooltip title="Back to pages list">
        <IconButton edge="start" component={RouterLink} to="/pages">
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      <Stack direction="row" spacing={2} justifyContent="space-between" width="100%">
        <TextStyled component="h1">{formatDate(new Date(page.date))}</TextStyled>
        <TextStyled component="span">{totalCalories} kcal</TextStyled>
      </Stack>
    </Box>
  );
};
