import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import dateFnsFormat from 'date-fns/format';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../../__shared__/hooks';

const PageContentHeader: React.FC = () => {
  const page = useAppSelector(state => state.pages.current);

  if (!page) {
    return null;
  }

  const currentPageDate = dateFnsFormat(new Date(page.date), 'dd.MM.yyyy');

  return (
    <Box mb={2}>
      <Breadcrumbs>
        <Link component={RouterLink} fontWeight="bold" to="/pages" underline="hover">
          Pages
        </Link>
        <Typography variant="body1" component="h1" fontWeight="bold">
          {currentPageDate}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
};

export default PageContentHeader;
