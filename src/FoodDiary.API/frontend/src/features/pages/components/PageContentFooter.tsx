import React from 'react';
import { makeStyles, Grid, AppBar } from '@material-ui/core';
import { MealsListSummary } from '../../notes/components';
import PageContentBottomNavigation from './PageContentBottomNavigation';

const useStyles = makeStyles(theme => ({
  root: {
    top: 'auto',
    bottom: 0,
    marginTop: theme.spacing(2),
  },
  footerContent: {
    padding: `0 ${theme.spacing(2)}px`,
  },
  summaryContainer: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const PageContentFooter: React.FC = () => {
  const classes = useStyles();

  return (
    <AppBar
      component="footer"
      position="sticky"
      color="default"
      variant="outlined"
      className={classes.root}
    >
      <Grid container className={classes.footerContent}>
        <Grid item xs>
          <PageContentBottomNavigation></PageContentBottomNavigation>
        </Grid>
        <Grid item className={classes.summaryContainer}>
          <MealsListSummary></MealsListSummary>
        </Grid>
      </Grid>
    </AppBar>
  );
};

export default PageContentFooter;
