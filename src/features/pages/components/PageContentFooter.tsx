import React from 'react';
import { makeStyles, Grid } from '@material-ui/core';
import { MealsListSummary } from '../../notes/components';
import PageContentBottomNavigation from './PageContentBottomNavigation';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(1),
  },
  summaryContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${theme.spacing(1)}px`,
  },
}));

const PageContentFooter: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid container className={classes.root}>
      <Grid item xs>
        <PageContentBottomNavigation></PageContentBottomNavigation>
      </Grid>
      <Grid item className={classes.summaryContainer}>
        <MealsListSummary></MealsListSummary>
      </Grid>
    </Grid>
  );
};

export default PageContentFooter;
