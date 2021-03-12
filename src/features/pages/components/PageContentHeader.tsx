import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, makeStyles, Typography } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { useTypedSelector } from '../../__shared__/hooks';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const PageContentHeader: React.FC = () => {
  const classes = useStyles();
  const page = useTypedSelector(state => state.pages.current);

  if (!page) {
    return null;
  }

  const currentPageDate = new Date(page.date).toLocaleDateString();

  return (
    <Breadcrumbs separator={<NavigateNextIcon></NavigateNextIcon>} className={classes.root}>
      <Link variant="h1" component={RouterLink} to="/pages">
        Pages
      </Link>
      <Typography variant="h1">{currentPageDate}</Typography>
    </Breadcrumbs>
  );
};

export default PageContentHeader;
