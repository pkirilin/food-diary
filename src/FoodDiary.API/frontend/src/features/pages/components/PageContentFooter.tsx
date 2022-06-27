import React from 'react';
import { Grid, AppBar } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { MealsListSummary } from '../../notes/components';
import PageContentBottomNavigation from './PageContentBottomNavigation';

const useStyles = makeStyles(theme => ({
  root: {
    top: 'auto',
    bottom: 0,
    marginTop: theme.spacing(2),
  },
  footerContent: {
    padding: `0 ${theme.spacing(2)}`,
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
      className={classes.root}
      variant="outlined"
      // Used to fix error https://github.com/mui/material-ui/issues/24606
      elevation={0}
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
