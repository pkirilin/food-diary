import { Button, ButtonProps, CircularProgress } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}));

export interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
}

export default function LoadingButton({ isLoading, disabled, ...props }: LoadingButtonProps) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <Button {...props} disabled={disabled || isLoading}></Button>
        {isLoading && (
          <CircularProgress size={24} color="primary" className={classes.buttonProgress} />
        )}
      </div>
    </div>
  );
}
