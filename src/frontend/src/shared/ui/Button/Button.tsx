import {
  Box,
  CircularProgress,
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
} from '@mui/material';
import { type FC } from 'react';

interface Props extends MuiButtonProps {
  loading?: boolean;
}

export const Button: FC<Props> = ({ children, loading, disabled, ...props }) => (
  <MuiButton {...props} disabled={!!disabled || loading}>
    <Box
      component="span"
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={theme => theme.spacing(1)}
    >
      {loading && <CircularProgress size={16} />}
      {children}
    </Box>
  </MuiButton>
);
