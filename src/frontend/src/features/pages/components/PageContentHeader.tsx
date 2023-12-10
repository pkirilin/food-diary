import { Breadcrumbs, Link, Stack, Typography } from '@mui/material';
import { useMemo, type FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Calories } from 'src/components';
import { formatDate } from 'src/utils';
import { useAppSelector } from '../../__shared__/hooks';

const PageContentHeader: FC = () => {
  const page = useAppSelector(state => state.pages.current);

  const noteItems = useAppSelector(state => state.notes.noteItems);

  const totalCalories = useMemo(
    () => noteItems.reduce((sum, note) => sum + note.calories, 0),
    [noteItems],
  );

  if (!page) {
    return null;
  }

  return (
    <Stack direction="row" mb={2} gap={2} justifyContent="space-between" alignItems="center">
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
  );
};

export default PageContentHeader;
