import makeStyles from '@mui/styles/makeStyles';

export const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
}));

export const useFilterStyles = makeStyles(theme => ({
  root: {
    width: '450px',
    padding: theme.spacing(2),
  },
  controls: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: theme.spacing(2),

    '& > :not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
}));

export const useFilterAppliedParamsStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    margin: theme.spacing(2),

    '& > :not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
}));
