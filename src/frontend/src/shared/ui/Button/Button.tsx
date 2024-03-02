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

export const Button: FC<Props> = ({ children, loading, disabled, color, ...props }) => (
  <MuiButton {...props} disabled={!!disabled || loading} color={color}>
    {loading && <CircularProgress size={16} color={color} sx={{ position: 'absolute' }} />}
    <Box visibility={loading ? 'hidden' : 'visible'}>{children}</Box>
  </MuiButton>
);
