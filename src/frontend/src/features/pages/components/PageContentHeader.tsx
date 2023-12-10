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
import { formatDate } from 'src/utils';
import { useAppSelector } from '../../__shared__/hooks';

const DIVIDER_VISIBLE_SCROLL_THRESHOLD = 16;

const PageContentHeader: FC = () => {
  const page = useAppSelector(state => state.pages.current);
  const noteItems = useAppSelector(state => state.notes.noteItems);

  const totalCalories = useMemo(
    () => noteItems.reduce((sum, note) => sum + note.calories, 0),
    [noteItems],
  );

  const dividerVisible = useScrollTrigger({
    threshold: DIVIDER_VISIBLE_SCROLL_THRESHOLD,
    disableHysteresis: true,
  });

  if (!page) {
    return null;
  }

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
