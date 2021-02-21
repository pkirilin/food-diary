import { makeStyles } from '@material-ui/core';

export const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  title: {
    flex: '1 1 100%',
  },
}));

export const useFilterStyles = makeStyles(theme => ({
  root: {
    width: '450px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& > :not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
}));
