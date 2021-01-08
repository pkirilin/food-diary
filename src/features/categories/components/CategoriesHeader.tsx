import React from 'react';
import { Fab, Grid, makeStyles, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const CategoriesHeader: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid container justify="space-between" alignItems="center" className={classes.root}>
      <Typography variant="h1">Categories</Typography>
      <Tooltip title="Add new category">
        <Fab color="primary" size="small">
          <AddIcon />
        </Fab>
      </Tooltip>
    </Grid>
  );
};

export default CategoriesHeader;
