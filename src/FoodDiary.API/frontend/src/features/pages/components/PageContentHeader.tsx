import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import dateFnsFormat from 'date-fns/format';
import { useAppSelector } from '../../__shared__/hooks';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const PageContentHeader: React.FC = () => {
  const classes = useStyles();
  const page = useAppSelector(state => state.pages.current);

  if (!page) {
    return null;
  }

  const currentPageDate = dateFnsFormat(new Date(page.date), 'dd.MM.yyyy');

  return (
    <Breadcrumbs separator={<NavigateNextIcon />} className={classes.root}>
      <Link variant="h1" component={RouterLink} to="/pages" underline="hover">
        Pages
      </Link>
      <Typography variant="h1">{currentPageDate}</Typography>
    </Breadcrumbs>
  );
};

export default PageContentHeader;
