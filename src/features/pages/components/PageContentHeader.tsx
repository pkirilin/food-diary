import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';

const pageDate = new Date('2020-01-10').toLocaleDateString();

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(2),
  },
}));

const PageContentHeader: React.FC = () => {
  const classes = useStyles();

  return (
    <Typography variant="h1" align="center" className={classes.root}>
      {pageDate}
    </Typography>
  );
};

export default PageContentHeader;
