import {
  Box,
  Breadcrumbs,
  Container,
  Link,
  Stack,
  Typography,
  useScrollTrigger,
} from '@mui/material';
import { useMemo, type FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Calories } from 'src/components';
import { APP_BAR_HEIGHT } from 'src/constants';
import { notesApi } from 'src/features/notes';
import { formatDate } from 'src/utils';
import { type Page } from '../models';

const DIVIDER_VISIBLE_SCROLL_THRESHOLD = 16;

interface Props {
  page: Page;
}

const PageContentHeader: FC<Props> = ({ page }) => {
  const getNotesQuery = notesApi.useGetNotesQuery({ pageId: page.id });
  const notes = useMemo(() => getNotesQuery.data ?? [], [getNotesQuery.data]);
  const totalCalories = useMemo(() => notes.reduce((sum, note) => sum + note.calories, 0), [notes]);

  const dividerVisible = useScrollTrigger({
    threshold: DIVIDER_VISIBLE_SCROLL_THRESHOLD,
    disableHysteresis: true,
  });

  return (
    <Box
      position="sticky"
      top={APP_BAR_HEIGHT}
      zIndex={1}
      bgcolor={theme => theme.palette.background.default}
      sx={theme => ({
        '::before': {
          content: '""',
          position: 'absolute',
          display: dividerVisible ? 'block' : 'none',
          left: 0,
          bottom: 0,
          width: '100%',
          border: `1px solid ${theme.palette.divider}`,
        },
      })}
    >
      <Stack
        component={Container}
        direction="row"
        py={3}
        gap={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Breadcrumbs>
          <Link component={RouterLink} fontWeight="bold" to="/pages" underline="hover">
            Pages
          </Link>
          <Typography variant="body1" component="h1" fontWeight="bold">
            {formatDate(new Date(page.date))}
          </Typography>
        </Breadcrumbs>
        <Calories amount={totalCalories} />
      </Stack>
    </Box>
  );
};

export default PageContentHeader;
