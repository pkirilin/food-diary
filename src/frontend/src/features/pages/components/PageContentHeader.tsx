import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { type FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate } from 'src/utils';
import { useAppSelector } from '../../__shared__/hooks';

const PageContentHeader: FC = () => {
  const page = useAppSelector(state => state.pages.current);

  if (!page) {
    return null;
  }

  return (
    <Box mb={2}>
      <Breadcrumbs>
        <Link component={RouterLink} fontWeight="bold" to="/pages" underline="hover">
          Pages
        </Link>
        <Typography variant="body1" component="h1" fontWeight="bold">
          {formatDate(new Date(page.date))}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
};

export default PageContentHeader;
