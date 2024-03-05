import makeStyles from '@mui/styles/makeStyles';

export const useFilterAppliedParamsStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    margin: theme.spacing(2),

    '& > :not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
}));
