import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useScrollTrigger,
} from '@mui/material';
import { useMemo, type FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { notesApi } from 'src/features/notes';
import { formatDate } from 'src/utils';
import { type Page } from '../models';

const DIVIDER_VISIBLE_SCROLL_THRESHOLD = 16;

interface Props {
  page: Page;
}

export const PageDetailHeader: FC<Props> = ({ page }) => {
  const getNotesQuery = notesApi.useGetNotesQuery({ pageId: page.id });
  const notes = useMemo(() => getNotesQuery.data ?? [], [getNotesQuery.data]);
  const totalCalories = useMemo(() => notes.reduce((sum, note) => sum + note.calories, 0), [notes]);

  const pageScrolled = useScrollTrigger({
    threshold: DIVIDER_VISIBLE_SCROLL_THRESHOLD,
    disableHysteresis: true,
  });

  return (
    <AppBar color="inherit" position="static" elevation={pageScrolled ? 1 : 0} component="nav">
      <Container>
        <Toolbar disableGutters component={Box} display="flex" alignItems="baseline" gap={2}>
          <Tooltip title="Back to pages list">
            <IconButton edge="start" component={RouterLink} to="/pages">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Stack direction="row" spacing={2} justifyContent="space-between" width="100%">
            <Typography variant="body1" component="h1" fontWeight="bold">
              {formatDate(new Date(page.date))}
            </Typography>
            <Typography variant="body1" component="span" fontWeight="bold">
              {totalCalories} kcal
            </Typography>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
