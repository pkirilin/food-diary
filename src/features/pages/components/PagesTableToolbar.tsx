import React from 'react';
import { IconButton, makeStyles, Toolbar, Tooltip, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';
import PublishIcon from '@material-ui/icons/Publish';
import DeleteIcon from '@material-ui/icons/Delete';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { useTypedSelector } from '../../__shared__/hooks';

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
  const selectedPageIds = useTypedSelector(state => state.pages.selectedPageIds);

  return (
    <Toolbar className={classes.root}>
      {selectedPageIds.length > 0 ? (
        <React.Fragment>
          <Typography className={classes.title}>{selectedPageIds.length} selected</Typography>
          <Tooltip title="Export selected pages">
            <span>
              <IconButton disabled>
                <CloudDownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete selected pages">
            <span>
              <IconButton disabled>
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography variant="h1" className={classes.title}>
            Pages
          </Typography>
          <Tooltip title="Add new page">
            <span>
              <IconButton disabled>
                <AddIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Filter pages">
            <span>
              <IconButton disabled>
                <FilterListIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Import pages">
            <span>
              <IconButton disabled>
                <PublishIcon />
              </IconButton>
            </span>
          </Tooltip>
        </React.Fragment>
      )}
    </Toolbar>
  );
};

export default PagesTableToolbar;
