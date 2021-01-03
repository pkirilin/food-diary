import React from 'react';
import { IconButton, makeStyles, Toolbar, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';
import PublishIcon from '@material-ui/icons/Publish';

const useStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  title: {
    flex: '1 1 100%',
  },
}));

const PagesTableToolbar: React.FC = () => {
  const classes = useStyles();

  return (
    <Toolbar className={classes.root}>
      <Typography variant="h1" className={classes.title}>
        Pages
      </Typography>
      <Tooltip title="Add new page">
        <IconButton>
          <AddIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Filter pages">
        <IconButton>
          <FilterListIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Import pages">
        <IconButton>
          <PublishIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
};

export default PagesTableToolbar;
